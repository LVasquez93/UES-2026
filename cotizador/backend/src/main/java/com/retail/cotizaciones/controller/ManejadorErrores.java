package com.retail.cotizaciones.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class ManejadorErrores {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> validacion(MethodArgumentNotValidException ex) {
        Map<String, String> campos = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> campos.put(e.getField(), e.getDefaultMessage()));
        return respuesta(HttpStatus.BAD_REQUEST, "Datos inválidos", campos);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> noEncontrado(IllegalArgumentException ex) {
        return respuesta(HttpStatus.NOT_FOUND, ex.getMessage(), null);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> servidor(RuntimeException ex) {
        return respuesta(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), null);
    }

    private ResponseEntity<Map<String, Object>> respuesta(HttpStatus status, String mensaje, Object detalle) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", mensaje);
        if (detalle != null) body.put("detalle", detalle);
        return ResponseEntity.status(status).body(body);
    }
}
