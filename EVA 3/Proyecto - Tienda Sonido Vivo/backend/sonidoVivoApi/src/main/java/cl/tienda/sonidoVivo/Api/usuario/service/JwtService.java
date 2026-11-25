package cl.tienda.sonidoVivo.Api.usuario.service;

import java.time.Instant;
import java.util.Date;

import javax.crypto.SecretKey;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private static final long DURACION_MS = 8 * 60 * 60 * 1000L;

    private final SecretKey claveFirma;

    public JwtService(@Value("${app.jwt.secret}") String secretoBase64) {
        byte[] bytes = Decoders.BASE64.decode(secretoBase64);
        this.claveFirma = Keys.hmacShaKeyFor(bytes);
    }

    public String generarToken(String correo, String rol) {
        Instant ahora = Instant.now();

        return Jwts.builder()
                .subject(correo)
                .claim("rol", rol)
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(ahora.plusMillis(DURACION_MS)))
                .signWith(claveFirma)
                .compact();
    }

    public String obtenerCorreo(String token) {
        return obtenerClaims(token).getSubject();
    }

    public boolean esValido(String token) {
        try {
            obtenerClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("JWT rechazado: {}", e.getClass().getSimpleName());
            return false;
        }
    }

    private Claims obtenerClaims(String token) {
        return Jwts.parser()
                .verifyWith(claveFirma)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
