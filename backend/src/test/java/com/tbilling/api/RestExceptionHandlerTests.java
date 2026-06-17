package com.tbilling.api;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.BadCredentialsException;

class RestExceptionHandlerTests {
  private final RestExceptionHandler handler = new RestExceptionHandler();

  @Test
  void authenticationFailuresReturnUnauthorized() {
    MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");

    ResponseEntity<Map<String, Object>> response =
        handler.authentication(new BadCredentialsException("Bad credentials"), request);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    assertThat(response.getBody())
        .containsEntry("status", HttpStatus.UNAUTHORIZED.value())
        .containsEntry("message", "Invalid login")
        .containsEntry("path", "/api/v1/auth/login");
  }
}
