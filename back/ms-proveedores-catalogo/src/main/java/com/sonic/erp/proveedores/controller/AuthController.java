package com.sonic.erp.proveedores.controller;

import com.sonic.erp.proveedores.dto.request.LoginRequest;
import com.sonic.erp.proveedores.dto.response.LoginResponse;
import com.sonic.erp.proveedores.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {

        LoginResponse response = authService.autenticar(
                request.getUsername(),
                request.getPassword()
        );

        if (response == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("mensaje", "Usuario, contraseña incorrectos o cuenta inactiva"));
        }

        return ResponseEntity.ok(response);
    }
}