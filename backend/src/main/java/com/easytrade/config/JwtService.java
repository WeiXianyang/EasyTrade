package com.easytrade.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final JwtProperties properties;
  private final SecretKey key;

  public JwtService(JwtProperties properties) {
    this.properties = properties;
    this.key = Keys.hmacShaKeyFor(normalizeSecret(properties.secret()).getBytes(StandardCharsets.UTF_8));
  }

  public String generateToken(String userId, String phone, String role) {
    Instant now = Instant.now();
    return Jwts.builder()
        .subject(userId)
        .claim("phone", phone)
        .claim("role", role)
        .issuedAt(Date.from(now))
        .expiration(Date.from(now.plusMillis(properties.expirationMs())))
        .signWith(key)
        .compact();
  }

  public Claims parse(String token) {
    return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
  }

  private String normalizeSecret(String rawSecret) {
    String secret = rawSecret == null ? "" : rawSecret.trim();
    if (secret.length() >= 32) {
      return secret;
    }
    return (secret + "easytrade-secret-padding-easytrade-secret-padding").substring(0, 32);
  }
}
