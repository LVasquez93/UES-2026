package com.dentalcare.api.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

/**
 * Componente utilitario para la generacion y validacion de JWT.
 *
 * Dependencia requerida en pom.xml:
 *   <dependency>
 *     <groupId>io.jsonwebtoken</groupId>
 *     <artifactId>jjwt-api</artifactId>
 *     <version>0.11.5</version>
 *   </dependency>
 *   <dependency>
 *     <groupId>io.jsonwebtoken</groupId>
 *     <artifactId>jjwt-impl</artifactId>
 *     <version>0.11.5</version>
 *     <scope>runtime</scope>
 *   </dependency>
 *   <dependency>
 *     <groupId>io.jsonwebtoken</groupId>
 *     <artifactId>jjwt-jackson</artifactId>
 *     <version>0.11.5</version>
 *     <scope>runtime</scope>
 *   </dependency>
 *
 * Propiedades requeridas en application.properties:
 *   jwt.secret=clave-secreta-larga-de-minimo-32-caracteres-para-HS256
 *   jwt.expiration.ms=86400000
 */
@Component
public class JwtUtil {

    // La clave secreta se inyecta desde application.properties, nunca hardcodeada
    @Value("${jwt.secret}")
    private String secret;

    // Tiempo de expiracion en milisegundos (por defecto 24 horas)
    @Value("${jwt.expiration.ms}")
    private long expirationMs;

    /**
     * Construye la clave criptografica a partir del secreto configurado.
     */
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    /**
     * Genera un JWT firmado con los datos del usuario autenticado.
     *
     * @param username identificador del sujeto del token
     * @param rol      nombre del rol para autorizacion en el cliente
     * @return JWT en formato compacto (header.payload.signature)
     */
    public String generateToken(String username, String rol) {
        return Jwts.builder()
                .setSubject(username)
                .claim("rol", rol)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extrae el username (subject) del token.
     */
    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * Valida que el token tenga firma correcta y no haya expirado.
     *
     * @return true si el token es valido
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // Token invalido, expirado o malformado
            return false;
        }
    }

    /**
     * Parsea y verifica la firma del token. Lanza excepcion si es invalido.
     */
    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}