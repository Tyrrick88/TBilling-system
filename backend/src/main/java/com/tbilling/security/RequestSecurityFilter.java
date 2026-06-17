package com.tbilling.security;

import com.tbilling.config.TbillingProperties;
import com.tbilling.config.TbillingProperties.Geofence;
import com.tbilling.config.TbillingProperties.RateLimit;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Clock;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class RequestSecurityFilter extends OncePerRequestFilter {
  private static final Set<String> COUNTRY_HEADERS =
      Set.of("X-Vercel-IP-Country", "CF-IPCountry", "CloudFront-Viewer-Country", "X-Country-Code");

  private final TbillingProperties properties;
  private final Clock clock;
  private final Map<String, RateWindow> windows = new ConcurrentHashMap<>();

  @Autowired
  public RequestSecurityFilter(TbillingProperties properties) {
    this(properties, Clock.systemUTC());
  }

  RequestSecurityFilter(TbillingProperties properties, Clock clock) {
    this.properties = properties;
    this.clock = clock;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String path = request.getRequestURI();
    if (shouldBypass(path)) {
      filterChain.doFilter(request, response);
      return;
    }

    Geofence geofence = properties.security().geofence();
    if (geofence.enabled() && !countryAllowed(request, geofence)) {
      reject(response, HttpServletResponse.SC_FORBIDDEN, "Request blocked by geofence");
      return;
    }

    RateLimit rateLimit = properties.security().rateLimit();
    RatePolicy policy = policyFor(path, rateLimit);
    if (rateLimit.enabled() && policy.limit() > 0 && !allow(request, response, policy)) {
      reject(response, 429, "Too many requests");
      return;
    }

    filterChain.doFilter(request, response);
  }

  private boolean shouldBypass(String path) {
    return path.startsWith("/actuator/health") || path.startsWith("/ws/");
  }

  private boolean countryAllowed(HttpServletRequest request, Geofence geofence) {
    String country = countryCode(request);
    if (country.isBlank()) {
      return !geofence.blockUnknown();
    }

    return geofence.allowedCountries().stream()
        .map(value -> value.toUpperCase(Locale.ROOT).trim())
        .anyMatch(country::equals);
  }

  private String countryCode(HttpServletRequest request) {
    return COUNTRY_HEADERS.stream()
        .map(request::getHeader)
        .filter(value -> value != null && !value.isBlank())
        .findFirst()
        .orElse("")
        .trim()
        .toUpperCase(Locale.ROOT);
  }

  private RatePolicy policyFor(String path, RateLimit rateLimit) {
    if (path.startsWith("/api/v1/auth/")) {
      return new RatePolicy("auth", rateLimit.authPerMinute(), rateLimit.windowSeconds());
    }
    if (path.contains("/payments/") || path.startsWith("/api/v1/payments/")) {
      return new RatePolicy("payment", rateLimit.paymentPerMinute(), rateLimit.windowSeconds());
    }
    if (path.startsWith("/api/v1/")) {
      return new RatePolicy("api", rateLimit.apiPerMinute(), rateLimit.windowSeconds());
    }
    return new RatePolicy("default", 0, rateLimit.windowSeconds());
  }

  private boolean allow(HttpServletRequest request, HttpServletResponse response, RatePolicy policy) {
    long now = clock.millis();
    long windowMs = Math.max(1, policy.windowSeconds()) * 1000L;
    String key = policy.name() + ":" + clientIp(request);
    RateWindow window =
        windows.compute(
            key,
            (ignored, current) -> {
              if (current == null || now >= current.resetAt()) {
                return new RateWindow(now + windowMs, 1);
              }
              return new RateWindow(current.resetAt(), current.count() + 1);
            });

    int remaining = Math.max(0, policy.limit() - window.count());
    response.setHeader("X-RateLimit-Limit", String.valueOf(policy.limit()));
    response.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));
    response.setHeader("X-RateLimit-Reset", String.valueOf(window.resetAt() / 1000));
    return window.count() <= policy.limit();
  }

  private String clientIp(HttpServletRequest request) {
    String forwardedFor = request.getHeader("X-Forwarded-For");
    if (forwardedFor != null && !forwardedFor.isBlank()) {
      return forwardedFor.split(",", 2)[0].trim();
    }

    String realIp = request.getHeader("X-Real-IP");
    if (realIp != null && !realIp.isBlank()) {
      return realIp.trim();
    }

    return request.getRemoteAddr() == null ? "unknown" : request.getRemoteAddr();
  }

  private void reject(HttpServletResponse response, int status, String message) throws IOException {
    response.setStatus(status);
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    response.getWriter().write("{\"message\":\"" + message + "\"}");
  }

  private record RatePolicy(String name, int limit, int windowSeconds) {}

  private record RateWindow(long resetAt, int count) {}
}
