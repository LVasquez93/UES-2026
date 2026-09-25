package com.retail.cotizaciones.controller;

import com.retail.cotizaciones.dto.CotizacionRequest;
import com.retail.cotizaciones.dto.CotizacionResponse;
import com.retail.cotizaciones.model.Cotizacion;
import com.retail.cotizaciones.service.CotizacionService;
import jakarta.validation.Valid;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cotizaciones")
public class CotizacionController {

    private final CotizacionService servicio;

    public CotizacionController(CotizacionService servicio) {
        this.servicio = servicio;
    }

    /** Crea la cotización, genera el PDF y devuelve el resumen. */
    @PostMapping
    public CotizacionResponse crear(@Valid @RequestBody CotizacionRequest req) {
        return CotizacionResponse.desde(servicio.crear(req));
    }

    /** Historial de cotizaciones (más recientes primero). */
    @GetMapping
    public List<CotizacionResponse> listar() {
        return servicio.listar().stream().map(CotizacionResponse::desde).toList();
    }

    @GetMapping("/{id}")
    public CotizacionResponse obtener(@PathVariable Long id) {
        return CotizacionResponse.desde(servicio.obtener(id));
    }

    /** Descarga el PDF de una cotización. */
    @GetMapping("/{id}/pdf")
    public ResponseEntity<Resource> descargarPdf(@PathVariable Long id) {
        Cotizacion cot = servicio.obtener(id);
        byte[] pdf = servicio.leerPdf(cot);
        String nombre = "Cotizacion_" + cot.getNumero() + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + nombre + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(new ByteArrayResource(pdf));
    }
}
