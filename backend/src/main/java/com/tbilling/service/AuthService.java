package com.tbilling.service;

import com.tbilling.api.ApiException;
import com.tbilling.api.Contracts.AuthResponse;
import com.tbilling.api.Contracts.LoginRequest;
import com.tbilling.api.Contracts.RefreshRequest;
import com.tbilling.api.ResponseMapper;
import com.tbilling.config.TbillingProperties;
import com.tbilling.domain.RefreshToken;
import com.tbilling.domain.UserAccount;
import com.tbilling.repository.RefreshTokenRepository;
import com.tbilling.repository.UserAccountRepository;
import com.tbilling.security.JwtService;
import java.time.Instant;
import java.util.UUID;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
  private final AuthenticationManager authenticationManager;
  private final UserAccountRepository users;
  private final RefreshTokenRepository refreshTokens;
  private final JwtService jwtService;
  private final TbillingProperties properties;

  public AuthService(
      AuthenticationManager authenticationManager,
      UserAccountRepository users,
      RefreshTokenRepository refreshTokens,
      JwtService jwtService,
      TbillingProperties properties) {
    this.authenticationManager = authenticationManager;
    this.users = users;
    this.refreshTokens = refreshTokens;
    this.jwtService = jwtService;
    this.properties = properties;
  }

  @Transactional
  public AuthResponse login(LoginRequest request) {
    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(request.email(), request.password()));
    UserAccount account =
        users
            .findByEmailIgnoreCase(request.email())
            .orElseThrow(() -> ApiException.unauthorized("Invalid login"));
    account.failedLoginAttempts = 0;
    account.lastLoginAt = Instant.now();
    return issueTokens(account);
  }

  @Transactional
  public AuthResponse refresh(RefreshRequest request) {
    RefreshToken refreshToken =
        refreshTokens
            .findByToken(request.refreshToken())
            .orElseThrow(() -> ApiException.unauthorized("Refresh token not found"));
    if (refreshToken.revoked || refreshToken.expiresAt.isBefore(Instant.now())) {
      throw ApiException.unauthorized("Refresh token expired");
    }
    refreshToken.revoked = true;
    return issueTokens(refreshToken.user);
  }

  private AuthResponse issueTokens(UserAccount account) {
    String accessToken = jwtService.issueAccessToken(account);
    RefreshToken refreshToken = new RefreshToken();
    refreshToken.user = account;
    refreshToken.token = UUID.randomUUID() + "." + UUID.randomUUID();
    refreshToken.expiresAt = Instant.now().plus(properties.jwt().refreshTtl());
    refreshTokens.save(refreshToken);
    return new AuthResponse(
        accessToken,
        refreshToken.token,
        jwtService.accessTokenExpiresAt(),
        refreshToken.expiresAt,
        ResponseMapper.user(account));
  }
}
