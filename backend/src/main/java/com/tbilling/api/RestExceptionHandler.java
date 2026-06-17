package com.tbilling.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class RestExceptionHandler {
  @ExceptionHandler(ApiException.class)
  ResponseEntity<Map<String, Object>> api(ApiException exception, HttpServletRequest request) {
    return body(exception.status(), exception.getMessage(), request.getRequestURI());
  }

  @ExceptionHandler({MethodArgumentNotValidException.class, ConstraintViolationException.class})
  ResponseEntity<Map<String, Object>> validation(Exception exception, HttpServletRequest request) {
    return body(HttpStatus.BAD_REQUEST, "Validation failed: " + exception.getMessage(), request.getRequestURI());
  }

  @ExceptionHandler(AccessDeniedException.class)
  ResponseEntity<Map<String, Object>> denied(AccessDeniedException exception, HttpServletRequest request) {
    return body(HttpStatus.FORBIDDEN, exception.getMessage(), request.getRequestURI());
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<Map<String, Object>> fallback(Exception exception, HttpServletRequest request) {
    return body(HttpStatus.INTERNAL_SERVER_ERROR, exception.getMessage(), request.getRequestURI());
  }

  private ResponseEntity<Map<String, Object>> body(HttpStatus status, String message, String path) {
    Map<String, Object> payload = new LinkedHashMap<>();
    payload.put("timestamp", Instant.now());
    payload.put("status", status.value());
    payload.put("error", status.getReasonPhrase());
    payload.put("message", message);
    payload.put("path", path);
    return ResponseEntity.status(status).body(payload);
  }
}
