package com.retail.cotizaciones.service;

import org.apache.poi.xwpf.usermodel.*;
import org.apache.xmlbeans.XmlCursor;
import org.apache.xmlbeans.XmlObject;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTP;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTRPr;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTRow;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTTxbxContent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Rellena el machote .docx conservando su diseño original.
 *
 * Estrategia (sin reescribir la plantilla):
 *  1. Reemplaza placeholders simples {{ clave }} en cuerpo, tablas, encabezado, pie
 *     Y cuadros de texto flotantes (ver nota abajo).
 *  2. Localiza la fila prototipo de la tabla (la que contiene "{{ i."), la clona
 *     una vez por producto, rellena los {{ i.* }} y la lista de características,
 *     y finalmente elimina la fila prototipo.
 *  3. Elimina los marcadores de control Jinja restantes ({% ... %}).
 *
 * Los tags del machote quedan intactos: este motor los interpreta como marcadores
 * de texto, no necesita que cambies la plantilla.
 *
 * IMPORTANTE — Cuadros de texto (w:txbxContent):
 * La API de alto nivel de POI (getParagraphs/getTables) NO recorre los párrafos
 * que viven dentro de cuadros de texto flotantes (comunes en membretes/diseños
 * de encabezado). Este machote tiene uno con el bloque "COTIZACIÓN / USUARIO",
 * así que se busca explícitamente con XmlCursor y se procesa igual que el resto.
 * Word suele duplicar ese contenido en dos representaciones (VML clásica +
 * DrawingML moderna) para compatibilidad; se procesan ambas, es inofensivo.
 */
@Service
public class PlantillaService {

    private static final Pattern CONTROL = Pattern.compile("\\{%.*?%\\}");

    @Value("${app.plantilla}")
    private String rutaPlantilla;

    /** Datos planos + lista de items ya formateados para el documento. */
    public byte[] generarDocx(Map<String, String> datos, List<ItemRender> items) throws Exception {
        ClassPathResource recurso = new ClassPathResource(rutaPlantilla);
        try (InputStream in = recurso.getInputStream();
             XWPFDocument doc = new XWPFDocument(in)) {

            // 1. Placeholders simples en todo el documento
            reemplazarEnCuerpo(doc, datos);

            // 2. Tabla de items
            llenarTablaItems(doc, items);

            // 3. Limpiar marcadores de control que hayan quedado sueltos
            limpiarControles(doc);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.write(out);
            return out.toByteArray();
        }
    }

    // ---------------------------------------------------------------------
    //  Reemplazo de placeholders simples
    // ---------------------------------------------------------------------

    private void reemplazarEnCuerpo(XWPFDocument doc, Map<String, String> datos) {
        for (XWPFParagraph p : doc.getParagraphs()) reemplazarEnParrafo(p, datos);
        for (XWPFTable t : doc.getTables()) reemplazarEnTabla(t, datos);
        for (XWPFHeader h : doc.getHeaderList()) {
            for (XWPFParagraph p : h.getParagraphs()) reemplazarEnParrafo(p, datos);
            for (XWPFTable t : h.getTables()) reemplazarEnTabla(t, datos);
        }
        for (XWPFFooter f : doc.getFooterList()) {
            for (XWPFParagraph p : f.getParagraphs()) reemplazarEnParrafo(p, datos);
            for (XWPFTable t : f.getTables()) reemplazarEnTabla(t, datos);
        }
        // Cuadros de texto flotantes (membrete con cotizacion_id / usuario, etc.)
        for (XWPFParagraph p : obtenerParrafosEnCuadrosDeTexto(doc)) reemplazarEnParrafo(p, datos);
    }

    /**
     * Recorre todo el XML del documento buscando bloques w:txbxContent (el
     * contenido de cuadros de texto flotantes) y devuelve sus párrafos como
     * objetos XWPFParagraph normales, para poder reutilizar la misma lógica
     * de reemplazo que el resto del documento.
     */
    private List<XWPFParagraph> obtenerParrafosEnCuadrosDeTexto(XWPFDocument doc) {
        List<XWPFParagraph> resultado = new ArrayList<>();
        XmlCursor cursor = doc.getDocument().getBody().newCursor();
        try {
            cursor.selectPath(
                "declare namespace w='http://schemas.openxmlformats.org/wordprocessingml/2006/main' .//w:txbxContent");
            while (cursor.hasNextSelection()) {
                cursor.toNextSelection();
                XmlObject obj = cursor.getObject();
                if (obj instanceof CTTxbxContent txbx) {
                    for (CTP ctp : txbx.getPList()) {
                        resultado.add(new XWPFParagraph(ctp, doc));
                    }
                }
            }
        } finally {
            cursor.dispose();
        }
        return resultado;
    }

    private void reemplazarEnTabla(XWPFTable tabla, Map<String, String> datos) {
        for (XWPFTableRow fila : tabla.getRows())
            for (XWPFTableCell celda : fila.getTableCells())
                for (XWPFParagraph p : celda.getParagraphs())
                    reemplazarEnParrafo(p, datos);
    }

    /**
     * Reemplaza claves dentro de un párrafo. Une el texto de todos los runs
     * (por si un tag quedó partido), aplica los reemplazos y reescribe el
     * resultado en el primer run, conservando su formato.
     */
    private void reemplazarEnParrafo(XWPFParagraph p, Map<String, String> datos) {
        String texto = p.getText();
        if (texto == null || (!texto.contains("{{") && !texto.contains("{%"))) return;

        String nuevo = texto;
        for (Map.Entry<String, String> e : datos.entrySet()) {
            nuevo = nuevo.replace("{{ " + e.getKey() + " }}", e.getValue());
            nuevo = nuevo.replace("{{" + e.getKey() + "}}", e.getValue());
        }
        if (nuevo.equals(texto)) return;

        escribirTextoEnParrafo(p, nuevo);
    }

    /**
     * Reemplaza TODO el contenido de un párrafo por un único run limpio.
     *
     * Los párrafos del machote suelen venir fragmentados en muchos runs por
     * el corrector ortográfico de Word (cada palabra en un <w:r> distinto,
     * con <w:proofErr/> intercalados). En vez de intentar reutilizar y mutar
     * uno de esos runs existentes, se captura su formato (rPr), se eliminan
     * TODOS los runs del párrafo y se crea uno nuevo desde cero con ese
     * formato. Esto evita depender del estado interno de runs ya mutados.
     */
    private void escribirTextoEnParrafo(XWPFParagraph p, String texto) {
        List<XWPFRun> runs = p.getRuns();

        CTRPr formatoOriginal = null;
        if (!runs.isEmpty() && runs.get(0).getCTR().isSetRPr()) {
            formatoOriginal = (CTRPr) runs.get(0).getCTR().getRPr().copy();
        }

        for (int i = runs.size() - 1; i >= 0; i--) {
            p.removeRun(i);
        }

        XWPFRun nuevo = p.createRun();
        if (formatoOriginal != null) {
            nuevo.getCTR().setRPr(formatoOriginal);
        }
        escribirConSaltos(nuevo, texto);
    }

    /**
     * Escribe texto en un run respetando saltos de línea ("\n" -> <w:br/>)
     * y tabulaciones ("\t" -> <w:tab/>) como elementos propios de OOXML,
     * en vez de caracteres literales dentro de <w:t>.
     */
    private void escribirConSaltos(XWPFRun run, String texto) {
        String[] lineas = texto.split("\n", -1);
        for (int li = 0; li < lineas.length; li++) {
            if (li > 0) run.addBreak();
            String[] partes = lineas[li].split("\t", -1);
            for (int ti = 0; ti < partes.length; ti++) {
                if (ti > 0) run.addTab();
                run.setText(partes[ti]);
            }
        }
    }

    // ---------------------------------------------------------------------
    //  Tabla de items: clonado de la fila prototipo
    // ---------------------------------------------------------------------

    private void llenarTablaItems(XWPFDocument doc, List<ItemRender> items) {
        for (XWPFTable tabla : doc.getTables()) {
            int idxProto = indiceFilaPrototipo(tabla);
            if (idxProto < 0) continue;

            XWPFTableRow prototipo = tabla.getRow(idxProto);
            int insertarEn = idxProto;

            for (ItemRender it : items) {
                CTRow ctRow = (CTRow) prototipo.getCtRow().copy();
                XWPFTableRow nueva = new XWPFTableRow(ctRow, tabla);
                rellenarFilaItem(nueva, it);
                tabla.addRow(nueva, insertarEn);
                insertarEn++;
            }
            // eliminar la fila prototipo, que quedó desplazada
            tabla.removeRow(insertarEn);
            return; // solo hay una tabla de items
        }
    }

    private int indiceFilaPrototipo(XWPFTable tabla) {
        List<XWPFTableRow> filas = tabla.getRows();
        for (int i = 0; i < filas.size(); i++) {
            if (filaContiene(filas.get(i), "{{ i.") || filaContiene(filas.get(i), "{{i.")) {
                return i;
            }
        }
        return -1;
    }

    private boolean filaContiene(XWPFTableRow fila, String fragmento) {
        for (XWPFTableCell celda : fila.getTableCells())
            for (XWPFParagraph p : celda.getParagraphs()) {
                String t = p.getText();
                if (t != null && t.contains(fragmento)) return true;
            }
        return false;
    }

    private void rellenarFilaItem(XWPFTableRow fila, ItemRender it) {
        Map<String, String> m = new LinkedHashMap<>();
        m.put("i.numero", it.numero());
        m.put("i.descripcion", it.descripcion());
        m.put("i.entrega", it.entrega());
        m.put("i.cantidad", it.cantidad());
        m.put("i.precio", it.precio());
        m.put("i.total", it.total());

        for (XWPFTableCell celda : fila.getTableCells()) {
            for (XWPFParagraph p : celda.getParagraphs()) {
                String t = p.getText();
                if (t == null) continue;

                // Características: el párrafo que contiene {{ c }} se sustituye
                // por todas las características, una por línea.
                if (t.contains("{{ c }}") || t.contains("{{c}}")) {
                    String unidas = String.join("\n", it.caracteristicas());
                    escribirTextoEnParrafo(p, unidas);
                    continue;
                }
                reemplazarEnParrafo(p, m);
            }
        }
    }

    // ---------------------------------------------------------------------
    //  Limpieza de marcadores de control {% ... %}
    // ---------------------------------------------------------------------

    private void limpiarControles(XWPFDocument doc) {
        for (XWPFParagraph p : doc.getParagraphs()) limpiarControlParrafo(p);
        for (XWPFTable t : doc.getTables())
            for (XWPFTableRow r : t.getRows())
                for (XWPFTableCell c : r.getTableCells())
                    for (XWPFParagraph p : c.getParagraphs())
                        limpiarControlParrafo(p);
        for (XWPFParagraph p : obtenerParrafosEnCuadrosDeTexto(doc)) limpiarControlParrafo(p);
    }

    private void limpiarControlParrafo(XWPFParagraph p) {
        String t = p.getText();
        if (t == null || !t.contains("{%")) return;
        String limpio = CONTROL.matcher(t).replaceAll("").trim();
        escribirTextoEnParrafo(p, limpio);
    }

    /** Item ya formateado (strings listos para el documento). */
    public record ItemRender(
            String numero,
            String descripcion,
            String entrega,
            String cantidad,
            String precio,
            String total,
            List<String> caracteristicas
    ) {
        public ItemRender {
            if (caracteristicas == null) caracteristicas = new ArrayList<>();
        }
    }
}
