package com.sonic.erp.proveedores.controller;

import com.sonic.erp.proveedores.dto.request.LoginRequest;
import com.sonic.erp.proveedores.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(
            @Valid @RequestBody LoginRequest request) {

        boolean credencialesValidas = authService.validarCredenciales(
                request.getUsername(),
                request.getPassword()
        );

        if (!credencialesValidas) {
            return ResponseEntity.status(401)
                    .body(Map.of("mensaje", "Usuario o contraseña incorrectos"));
        }

        return ResponseEntity.ok(
                Map.of("mensaje", "Inicio de sesión exitoso")
        );
    }
}