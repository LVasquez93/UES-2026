package com.retail.cotizaciones.dto;

import com.retail.cotizaciones.model.Cotizacion;
import java.math.BigDecimal;
import java.time.LocalDate;

/** Resumen que devuelve el backend tras crear o listar cotizaciones. */
public record CotizacionResponse(
        Long id,
        String numero,
        LocalDate fecha,
        String usuario,
        String clienteEmpresa,
        BigDecimal subtotal,
        BigDecimal iva,
        BigDecimal total,
        String totalLetras
) {
    public static CotizacionResponse desde(Cotizacion c) {
        return new CotizacionResponse(
                c.getId(), c.getNumero(), c.getFecha(), c.getUsuario(),
                c.getClienteEmpresa(), c.getSubtotal(), c.getIva(),
                c.getTotal(), c.getTotalLetras()
        );
    }
}
