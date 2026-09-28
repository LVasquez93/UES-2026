package com.retail.cotizaciones.repository;

import com.retail.cotizaciones.model.Cotizacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CotizacionRepository extends JpaRepository<Cotizacion, Long> {

    /** Cantidad de cotizaciones cuyo número empieza con el prefijo de fecha (yyyyMMdd). */
    long countByNumeroStartingWith(String prefijoFecha);

    List<Cotizacion> findAllByOrderByCreadoEnDesc();
}
