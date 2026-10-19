
package com.sonic.erp.cotizaciones.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> manejarErrorNegocio(
            ResponseStatusException ex,
            HttpServletRequest request) {

        Map<String, Object> respuesta = new LinkedHashMap<>();

        respuesta.put("status", ex.getStatusCode().value());
        respuesta.put("mensaje", ex.getReason() != null
                ? ex.getReason()
                : "No se pudo procesar la solicitud");
        respuesta.put("ruta", request.getRequestURI());

        return ResponseEntity
                .status(ex.getStatusCode())
                .body(respuesta);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> manejarValidaciones(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        String mensaje = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getDefaultMessage() != null
                        ? error.getDefaultMessage()
                        : "Campo inválido: " + error.getField())
                .distinct()
                .collect(Collectors.joining("; "));

        if (mensaje.isBlank()) {
            mensaje = "Los datos enviados no son válidos";
        }

        Map<String, Object> respuesta = new LinkedHashMap<>();

        respuesta.put("status", 400);
        respuesta.put("mensaje", mensaje);
        respuesta.put("ruta", request.getRequestURI());

        return ResponseEntity
                .badRequest()
                .body(respuesta);
    }
}
