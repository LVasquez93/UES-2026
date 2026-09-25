package com.retail.cotizaciones.service;

import com.ibm.icu.text.RuleBasedNumberFormat;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Locale;

/**
 * Convierte un monto a su representación en letras, equivalente al
 * numero_a_letras del script original (num2words).
 * Ej: 268.50 -> "DOSCIENTOS SESENTA Y OCHO DÓLARES CON 50/100"
 */
@Service
public class NumeroALetrasService {

    private final RuleBasedNumberFormat formato =
            new RuleBasedNumberFormat(new Locale("es"), RuleBasedNumberFormat.SPELLOUT);

    public String convertir(BigDecimal monto) {
        BigDecimal redondeado = monto.setScale(2, RoundingMode.HALF_UP);
        long entero = redondeado.longValue();
        int centavos = redondeado.subtract(BigDecimal.valueOf(entero))
                .movePointRight(2).intValue();

        String letras = formato.format(entero).toUpperCase(new Locale("es"));
        return String.format("%s DÓLARES CON %02d/100", letras, centavos);
    }
}
