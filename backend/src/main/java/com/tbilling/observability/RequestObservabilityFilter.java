package com.tbilling.observability;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class RequestObservabilityFilter extends OncePerRequestFilter {
  private static final Logger log = LoggerFactory.getLogger(RequestObservabilityFilter.class);
  private final ObjectMapper objectMapper;

  public RequestObservabilityFilter(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    String path = request.getRequestURI();
    return !path.startsWith("/api/v1/");
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    long startedAt = System.nanoTime();
    String requestId = requestId(request);
    MDC.put("requestId", requestId);
    response.setHeader("X-Request-ID", requestId);

    try {
      filterChain.doFilter(request, response);
      logRequest(request, response, requestId, startedAt, null);
    } catch (IOException | ServletException | RuntimeException exception) {
      logRequest(request, response, requestId, startedAt, exception);
      throw exception;
    } finally {
      MDC.remove("requestId");
    }
  }

  private void logRequest(
      HttpServletRequest request,
      HttpServletResponse response,
      String requestId,
      long startedAt,
      Exception exception) {
    int status = exception == null ? response.getStatus() : 500;
    long durationMs = (System.nanoTime() - startedAt) / 1_000_000;
    Map<String, Object> payload = new LinkedHashMap<>();
    payload.put("level", level(status));
    payload.put("service", "tbilling-backend");
    payload.put("event", "http_request");
    payload.put("timestamp", Instant.now().toString());
    payload.put("requestId", requestId);
    payload.put("method", request.getMethod());
    payload.put("path", request.getRequestURI());
    payload.put("status", status);
    payload.put("durationMs", durationMs);
    payload.put("clientIp", clientIp(request));
    payload.put("country", countryCode(request));
    if (exception != null) {
      payload.put("exception", exception.getClass().getSimpleName());
      payload.put("message", exception.getMessage());
    }

    String line = toJson(payload);
    if (status >= 500) {
      log.error(line, exception);
    } else if (status >= 400) {
      log.warn(line);
    } else {
      log.info(line);
    }
  }

  private String level(int status) {
    if (status >= 500) return "error";
    if (status >= 400) return "warn";
    return "info";
  }

  private String requestId(HttpServletRequest request) {
    String requestId = request.getHeader("X-Request-ID");
    if (requestId != null && !requestId.isBlank()) {
      return requestId.trim();
    }

    String vercelId = request.getHeader("X-Vercel-ID");
    if (vercelId != null && !vercelId.isBlank()) {
      return vercelId.trim();
    }

    return UUID.randomUUID().toString();
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

  private String countryCode(HttpServletRequest request) {
    for (String header :
        new String[] {"X-Vercel-IP-Country", "CF-IPCountry", "CloudFront-Viewer-Country", "X-Country-Code"}) {
      String value = request.getHeader(header);
      if (value != null && !value.isBlank()) {
        return value.trim().toUpperCase();
      }
    }
    return "";
  }

  private String toJson(Map<String, Object> payload) {
    try {
      return objectMapper.writeValueAsString(payload);
    } catch (JsonProcessingException exception) {
      return payload.toString();
    }
  }
}
