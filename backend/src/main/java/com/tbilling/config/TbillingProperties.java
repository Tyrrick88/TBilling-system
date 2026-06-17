package com.tbilling.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "tbilling")
public record TbillingProperties(
    Jwt jwt,
    SuperAdmin superAdmin,
    Jobs jobs,
    Daraja daraja,
    Mikrotik mikrotik,
    Storage storage) {

  public record Jwt(String secret, Duration accessTtl, Duration refreshTtl) {}

  public record SuperAdmin(String email, String password) {}

  public record Jobs(NetworkMonitor networkMonitor, ZeroRating zeroRating) {}

  public record NetworkMonitor(boolean enabled, Duration interval, int latencyThresholdMs, int failureThreshold) {}

  public record ZeroRating(boolean enabled) {}

  public record Daraja(
      String baseUrl,
      String consumerKey,
      String consumerSecret,
      String passkey,
      String callbackUrl,
      boolean sandboxMode) {}

  public record Mikrotik(String host, int port, String username, String password, boolean enabled) {}

  public record Storage(String publicBaseUrl, long maxLogoBytes) {}
}
