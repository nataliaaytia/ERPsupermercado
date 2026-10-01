package com.sonic.erp.proveedores.service;

import com.sonic.erp.proveedores.entity.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    private static final String SECRET_KEY = "sonic_erp_proveedores_secret_key_jwt_2026_super_segura";
    private final Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    public String generarToken(Usuario usuario) {
        long tiempoExpiracion = 86400000;

        return Jwts.builder()
                .setSubject(usuario.getUsername())
                .claim("idUsuario", usuario.getIdUsuario())
                .claim("rol", usuario.getRol())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + tiempoExpiracion))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extraerUsername(String token) {
        return extraerClaim(token, Claims::getSubject);
    }

    public <T> T extraerClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claimsResolver.apply(claims);
    }
}