package com.sonic.erp.proveedores.service;

import com.sonic.erp.proveedores.dto.response.LoginResponse;
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
    private final JwtService jwtService;

    public LoginResponse autenticar(String username, String password) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElse(null);

        if (usuario == null) {
            return null;
        }

        if (!"Activo".equalsIgnoreCase(usuario.getEstado())) {
            return null;
        }

        boolean passwordValida = false;

        try {
            passwordValida = passwordEncoder.matches(password, usuario.getPassword());
        } catch (Exception e) {
            passwordValida = false;
        }

        if (!passwordValida && password.equals(usuario.getPassword())) {
            passwordValida = true;
        }

        if (!passwordValida) {
            return null;
        }

        String token = jwtService.generarToken(usuario);

        return LoginResponse.builder()
                .token(token)
                .tipoToken("Bearer")
                .idUsuario(usuario.getIdUsuario())
                .username(usuario.getUsername())
                .rol(usuario.getRol())
                .mensaje("Inicio de sesión exitoso")
                .build();
    }
}