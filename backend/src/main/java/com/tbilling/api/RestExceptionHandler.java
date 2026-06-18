package com.tbilling.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class RestExceptionHandler {
  private static final Logger log = LoggerFactory.getLogger(RestExceptionHandler.class);
  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

  @ExceptionHandler(ApiException.class)
  ResponseEntity<Map<String, Object>> api(ApiException exception, HttpServletRequest request) {
    logHandledException(exception.status(), exception, request);
    return body(exception.status(), exception.getMessage(), request.getRequestURI());
  }

  @ExceptionHandler({MethodArgumentNotValidException.class, ConstraintViolationException.class})
  ResponseEntity<Map<String, Object>> validation(Exception exception, HttpServletRequest request) {
    logHandledException(HttpStatus.BAD_REQUEST, exception, request);
    return body(HttpStatus.BAD_REQUEST, "Validation failed: " + exception.getMessage(), request.getRequestURI());
  }

  @ExceptionHandler(AccessDeniedException.class)
  ResponseEntity<Map<String, Object>> denied(AccessDeniedException exception, HttpServletRequest request) {
    logHandledException(HttpStatus.FORBIDDEN, exception, request);
    return body(HttpStatus.FORBIDDEN, exception.getMessage(), request.getRequestURI());
  }

  @ExceptionHandler(AuthenticationException.class)
  ResponseEntity<Map<String, Object>> authentication(AuthenticationException exception, HttpServletRequest request) {
    logHandledException(HttpStatus.UNAUTHORIZED, exception, request);
    return body(HttpStatus.UNAUTHORIZED, "Invalid login", request.getRequestURI());
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<Map<String, Object>> fallback(Exception exception, HttpServletRequest request) {
    logHandledException(HttpStatus.INTERNAL_SERVER_ERROR, exception, request);
    return body(HttpStatus.INTERNAL_SERVER_ERROR, exception.getMessage(), request.getRequestURI());
  }

  private ResponseEntity<Map<String, Object>> body(HttpStatus status, String message, String path) {
    Map<String, Object> payload = new LinkedHashMap<>();
    payload.put("timestamp", Instant.now().toString());
    payload.put("status", status.value());
    payload.put("error", status.getReasonPhrase());
    payload.put("message", message);
    payload.put("path", path);
    return ResponseEntity.status(status).body(payload);
  }

  private void logHandledException(HttpStatus status, Exception exception, HttpServletRequest request) {
    Map<String, Object> payload = new LinkedHashMap<>();
    payload.put("level", status.is5xxServerError() ? "error" : "warn");
    payload.put("service", "tbilling-backend");
    payload.put("event", "api_exception");
    payload.put("timestamp", Instant.now().toString());
    payload.put("status", status.value());
    payload.put("method", request.getMethod());
    payload.put("path", request.getRequestURI());
    payload.put("requestId", request.getHeader("X-Request-ID"));
    payload.put("exception", exception.getClass().getSimpleName());
    payload.put("message", exception.getMessage());

    String line = toJson(payload);
    if (status.is5xxServerError()) {
      log.error(line, exception);
    } else {
      log.warn(line);
    }
  }

  private String toJson(Map<String, Object> payload) {
    try {
      return OBJECT_MAPPER.writeValueAsString(payload);
    } catch (JsonProcessingException exception) {
      return payload.toString();
    }
  }
}
