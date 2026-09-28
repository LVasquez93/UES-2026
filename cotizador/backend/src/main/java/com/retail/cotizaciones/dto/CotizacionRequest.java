package com.retail.cotizaciones.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

/** Datos que envía el frontend para crear una cotización. */
public record CotizacionRequest(

        @NotBlank String usuario,
        @NotBlank String clienteNombre,
        @NotBlank String clienteEmpresa,
        String clienteDepartamento,

        // Si vienen vacíos, el backend aplica los valores por defecto.
        String formaPago,
        String nota,

        @NotEmpty @Valid List<ItemRequest> items

) {
    public record ItemRequest(
            @NotBlank String descripcion,
            @NotNull @Min(1) Integer cantidad,
            @NotNull @DecimalMin("0.0") BigDecimal precio,
            String entrega,
            List<String> caracteristicas
    ) {}
}
