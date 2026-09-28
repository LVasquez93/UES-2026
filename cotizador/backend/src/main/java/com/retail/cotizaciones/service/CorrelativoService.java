package com.retail.cotizaciones.service;

import com.retail.cotizaciones.repository.CotizacionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Genera el correlativo con formato yyyyMMddNNN (ej. 20260625001).
 *
 * A diferencia del correlativo.txt del script original, aquí el contador vive
 * en la base de datos. La cuenta del día se calcula contando cotizaciones ya
 * guardadas con el prefijo de hoy, y la creación de la cotización ocurre dentro
 * de la misma transacción (ver CotizacionService), por lo que dos usuarios
 * concurrentes no obtienen el mismo número.
 */
@Service
public class CorrelativoService {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyyMMdd");
    private final CotizacionRepository repo;

    public CorrelativoService(CotizacionRepository repo) {
        this.repo = repo;
    }

    public synchronized String siguiente(LocalDate fecha) {
        String prefijo = fecha.format(FMT);
        long usadas = repo.countByNumeroStartingWith(prefijo);
        long correlativo = usadas + 1;
        return String.format("%s%03d", prefijo, correlativo);
    }
}
