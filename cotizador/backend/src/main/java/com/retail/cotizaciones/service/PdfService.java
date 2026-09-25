package com.retail.cotizaciones.service;

import com.documents4j.api.DocumentType;
import com.documents4j.api.IConverter;
import com.documents4j.job.LocalConverter;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;

/**
 * Convierte un .docx (ya rellenado) a PDF usando Microsoft Word instalado
 * en el servidor, vía documents4j.
 *
 * Nota: documents4j detecta automáticamente Word en Windows. Microsoft no
 * "soporta" oficialmente automatizar Office como servicio, pero documents4j
 * gestiona el proceso de Word y funciona de forma estable en la práctica.
 * Si en algún momento mueves a un servidor Linux sin Word, cambia este
 * convertidor por LibreOffice headless (ver README).
 *
 * El IConverter es costoso de crear, así que se mantiene uno solo para toda
 * la aplicación y se cierra al apagar.
 */
@Service
public class PdfService {

    private final IConverter converter = LocalConverter.builder().build();

    public byte[] convertirAPdf(byte[] docx) {
        try (ByteArrayInputStream in = new ByteArrayInputStream(docx);
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            converter.convert(in).as(DocumentType.DOCX)
                     .to(out).as(DocumentType.PDF)
                     .execute();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error al convertir a PDF: " + e.getMessage(), e);
        }
    }

    @PreDestroy
    public void cerrar() {
        converter.shutDown();
    }
}
