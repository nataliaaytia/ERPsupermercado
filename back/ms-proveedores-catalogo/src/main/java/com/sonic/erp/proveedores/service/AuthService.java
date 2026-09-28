package com.sonic.erp.proveedores.service;

import com.sonic.erp.proveedores.entity.Usuario;
import com.sonic.erp.proveedores.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public boolean validarCredenciales(String username, String password) {

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElse(null);

        if (usuario == null) {
            return false;
        }

        if (!"Activo".equalsIgnoreCase(usuario.getEstado())) {
            return false;
        }

        return passwordEncoder.matches(password, usuario.getPassword());
    }
}