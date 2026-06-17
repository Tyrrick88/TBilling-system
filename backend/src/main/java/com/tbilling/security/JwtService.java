package com.tbilling.security;

import com.tbilling.config.TbillingProperties;
import com.tbilling.domain.UserAccount;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final TbillingProperties properties;
  private final SecretKey key;

  public JwtService(TbillingProperties properties) {
    this.properties = properties;
    this.key = Keys.hmacShaKeyFor(sha256(properties.jwt().secret()));
  }

  public String issueAccessToken(UserAccount account) {
    Instant now = Instant.now();
    Instant expiresAt = now.plus(properties.jwt().accessTtl());
    return Jwts.builder()
        .subject(account.email)
        .claim("uid", account.id.toString())
        .claim("role", account.role.name())
        .claim("tenantId", account.tenant == null ? null : account.tenant.id.toString())
        .issuedAt(Date.from(now))
        .expiration(Date.from(expiresAt))
        .signWith(key)
        .compact();
  }

  public Instant accessTokenExpiresAt() {
    return Instant.now().plus(properties.jwt().accessTtl());
  }

  public Claims parse(String token) {
    return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
  }

  public String subject(String token) {
    return parse(token).getSubject();
  }

  public UUID tenantId(String token) {
    Object value = parse(token).get("tenantId");
    return value == null ? null : UUID.fromString(value.toString());
  }

  private byte[] sha256(String value) {
    try {
      return MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
    } catch (Exception exception) {
      throw new IllegalStateException("Unable to create JWT key", exception);
    }
  }
}
