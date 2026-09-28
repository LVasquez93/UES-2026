package com.retail.cotizaciones.service;

import com.retail.cotizaciones.dto.CotizacionRequest;
import com.retail.cotizaciones.model.Cotizacion;
import com.retail.cotizaciones.model.ItemCotizacion;
import com.retail.cotizaciones.repository.CotizacionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class CotizacionService {

    private static final String[] MESES = {
            "enero", "febrero", "marzo", "abril", "mayo", "junio",
            "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    };
    private static final String PAGO_DEFECTO =
            "CRÉDITO 30 DÍAS, TRANSFERENCIA BANCARIA O CHEQUE";
    private static final String NOTA_DEFECTO =
            "TIEMPOS DE ENTREGA Y PRECIOS SUJETOS A CAMBIOS EN INVENTARIO";
    private static final String ENTREGA_DEFECTO = "DE 6 A 8 SEMANAS";

    private final DecimalFormat dinero =
            new DecimalFormat("#,##0.00", new DecimalFormatSymbols(Locale.US));

    private final CotizacionRepository repo;
    private final CorrelativoService correlativo;
    private final NumeroALetrasService numeroALetras;
    private final PlantillaService plantilla;
    private final PdfService pdf;

    @Value("${app.iva}")
    private BigDecimal tasaIva;

    @Value("${app.pdf-dir}")
    private String dirPdf;

    public CotizacionService(CotizacionRepository repo, CorrelativoService correlativo,
                             NumeroALetrasService numeroALetras, PlantillaService plantilla,
                             PdfService pdf) {
        this.repo = repo;
        this.correlativo = correlativo;
        this.numeroALetras = numeroALetras;
        this.plantilla = plantilla;
        this.pdf = pdf;
    }

    @Transactional
    public Cotizacion crear(CotizacionRequest req) {
        LocalDate hoy = LocalDate.now();
        String numero = correlativo.siguiente(hoy);

        // --- Cálculo de totales en BigDecimal ---
        BigDecimal subtotal = BigDecimal.ZERO;
        List<ItemCotizacion> entidades = new ArrayList<>();
        List<PlantillaService.ItemRender> render = new ArrayList<>();

        int indice = 1;
        for (CotizacionRequest.ItemRequest in : req.items()) {
            BigDecimal precio = in.precio().setScale(2, RoundingMode.HALF_UP);
            BigDecimal totalItem = precio.multiply(BigDecimal.valueOf(in.cantidad()))
                    .setScale(2, RoundingMode.HALF_UP);
            subtotal = subtotal.add(totalItem);

            String entrega = vacioODefecto(in.entrega(), ENTREGA_DEFECTO).toUpperCase();
            List<String> caracteristicas = limpiarCaracteristicas(in.caracteristicas());
            String descripcion = in.descripcion().toUpperCase();

            // entidad para persistir
            ItemCotizacion ent = new ItemCotizacion();
            ent.setNumero(indice);
            ent.setDescripcion(descripcion);
            ent.setEntrega(entrega);
            ent.setCantidad(in.cantidad());
            ent.setPrecio(precio);
            ent.setTotal(totalItem);
            ent.setCaracteristicas(caracteristicas);
            entidades.add(ent);

            // datos para el documento
            render.add(new PlantillaService.ItemRender(
                    String.valueOf(indice), descripcion, entrega,
                    String.valueOf(in.cantidad()),
                    dinero.format(precio), dinero.format(totalItem),
                    caracteristicas
            ));
            indice++;
        }

        subtotal = subtotal.setScale(2, RoundingMode.HALF_UP);
        BigDecimal iva = subtotal.multiply(tasaIva).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(iva).setScale(2, RoundingMode.HALF_UP);
        String totalLetras = numeroALetras.convertir(total);

        String formaPago = vacioODefecto(req.formaPago(), PAGO_DEFECTO).toUpperCase();
        String nota = vacioODefecto(req.nota(), NOTA_DEFECTO).toUpperCase();

        // --- Entidad cotización ---
        Cotizacion cot = new Cotizacion();
        cot.setNumero(numero);
        cot.setFecha(hoy);
        cot.setUsuario(req.usuario().toUpperCase());
        cot.setClienteNombre(req.clienteNombre().toUpperCase());
        cot.setClienteEmpresa(req.clienteEmpresa().toUpperCase());
        cot.setClienteDepartamento(
                req.clienteDepartamento() == null ? "" : req.clienteDepartamento().toUpperCase());
        cot.setSubtotal(subtotal);
        cot.setIva(iva);
        cot.setTotal(total);
        cot.setTotalLetras(totalLetras);
        cot.setFormaPago(formaPago);
        cot.setNota(nota);
        entidades.forEach(cot::addItem);

        // --- Renderizado del documento y PDF ---
        try {
            Map<String, String> datos = new LinkedHashMap<>();
            datos.put("cotizacion_id", numero);
            datos.put("usuario", cot.getUsuario());
            datos.put("fecha", fechaLarga(hoy));
            datos.put("cliente_nombre", cot.getClienteNombre());
            datos.put("cliente_empresa", cot.getClienteEmpresa());
            datos.put("cliente_departamento", cot.getClienteDepartamento());
            datos.put("subtotal", dinero.format(subtotal));
            datos.put("iva", dinero.format(iva));
            datos.put("total_inversion", dinero.format(total));
            datos.put("total_letras", totalLetras);
            datos.put("forma_pago", formaPago);
            datos.put("nota", nota);

            byte[] docx = plantilla.generarDocx(datos, render);
            byte[] pdfBytes = pdf.convertirAPdf(docx);

            Path carpeta = Path.of(dirPdf);
            Files.createDirectories(carpeta);
            Path destino = carpeta.resolve("Cotizacion_" + numero + ".pdf");
            Files.write(destino, pdfBytes);
            cot.setPdfPath(destino.toString());

        } catch (Exception e) {
            throw new RuntimeException("No se pudo generar el documento: " + e.getMessage(), e);
        }

        return repo.save(cot);
    }

    @Transactional(readOnly = true)
    public List<Cotizacion> listar() {
        return repo.findAllByOrderByCreadoEnDesc();
    }

    @Transactional(readOnly = true)
    public Cotizacion obtener(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cotización no encontrada: " + id));
    }

    public byte[] leerPdf(Cotizacion cot) {
        try {
            return Files.readAllBytes(Path.of(cot.getPdfPath()));
        } catch (Exception e) {
            throw new RuntimeException("No se pudo leer el PDF de la cotización " + cot.getNumero(), e);
        }
    }

    // --- helpers ---
    private String vacioODefecto(String valor, String defecto) {
        return (valor == null || valor.isBlank()) ? defecto : valor;
    }

    private List<String> limpiarCaracteristicas(List<String> origen) {
        List<String> out = new ArrayList<>();
        if (origen == null) return out;
        for (String c : origen) {
            if (c == null || c.isBlank()) continue;
            String t = c.trim().toLowerCase();
            out.add(Character.toUpperCase(t.charAt(0)) + t.substring(1));
        }
        return out;
    }

    private String fechaLarga(LocalDate f) {
        return String.format("San Salvador, %d de %s de %d",
                f.getDayOfMonth(), MESES[f.getMonthValue() - 1], f.getYear());
    }
}
