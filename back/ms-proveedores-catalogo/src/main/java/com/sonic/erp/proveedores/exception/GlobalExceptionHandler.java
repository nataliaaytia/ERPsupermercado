package com.sonic.erp.proveedores.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> manejarErroresValidacion(
            MethodArgumentNotValidException ex) {

        List<String> errores = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getDefaultMessage())
                .toList();

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("mensaje", "Error de validacion");
        respuesta.put("errores", errores);

        return new ResponseEntity<>(respuesta, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> manejarIllegalArgumentException(
            IllegalArgumentException ex) {

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("mensaje", ex.getMessage());

        return new ResponseEntity<>(respuesta, HttpStatus.BAD_REQUEST);
    }
}