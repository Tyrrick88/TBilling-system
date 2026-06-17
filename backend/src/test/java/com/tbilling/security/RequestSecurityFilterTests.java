package com.tbilling.security;

import com.tbilling.config.TbillingProperties;
import com.tbilling.config.TbillingProperties.Daraja;
import com.tbilling.config.TbillingProperties.Geofence;
import com.tbilling.config.TbillingProperties.Jobs;
import com.tbilling.config.TbillingProperties.Mikrotik;
import com.tbilling.config.TbillingProperties.NetworkMonitor;
import com.tbilling.config.TbillingProperties.RateLimit;
import com.tbilling.config.TbillingProperties.Security;
import com.tbilling.config.TbillingProperties.Storage;
import com.tbilling.config.TbillingProperties.SuperAdmin;
import com.tbilling.config.TbillingProperties.ZeroRating;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;

class RequestSecurityFilterTests {
  private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-06-17T00:00:00Z"), ZoneOffset.UTC);

  @Test
  void blocksRequestsOutsideAllowedCountriesWhenGeofenceEnabled() throws Exception {
    RequestSecurityFilter filter =
        new RequestSecurityFilter(properties(true, false, List.of("KE"), true, 10), CLOCK);
    MockHttpServletRequest request = apiRequest("/api/v1/admin/packages");
    request.addHeader("X-Vercel-IP-Country", "US");
    MockHttpServletResponse response = new MockHttpServletResponse();

    filter.doFilter(request, response, new MockFilterChain());

    assertThat(response.getStatus()).isEqualTo(403);
    assertThat(response.getContentAsString()).contains("geofence");
  }

  @Test
  void rateLimitsByClientIpAndPolicy() throws Exception {
    RequestSecurityFilter filter =
        new RequestSecurityFilter(properties(false, false, List.of("KE"), true, 1), CLOCK);

    MockHttpServletResponse firstResponse = new MockHttpServletResponse();
    filter.doFilter(apiRequest("/api/v1/auth/login"), firstResponse, new MockFilterChain());

    MockHttpServletResponse secondResponse = new MockHttpServletResponse();
    filter.doFilter(apiRequest("/api/v1/auth/login"), secondResponse, new MockFilterChain());

    assertThat(firstResponse.getStatus()).isEqualTo(200);
    assertThat(secondResponse.getStatus()).isEqualTo(429);
    assertThat(secondResponse.getHeader("X-RateLimit-Remaining")).isEqualTo("0");
  }

  private MockHttpServletRequest apiRequest(String uri) {
    MockHttpServletRequest request = new MockHttpServletRequest("GET", uri);
    request.setRequestURI(uri);
    request.setRemoteAddr("10.0.0.5");
    return request;
  }

  private TbillingProperties properties(
      boolean geofenceEnabled,
      boolean blockUnknown,
      List<String> allowedCountries,
      boolean rateLimitEnabled,
      int authPerMinute) {
    return new TbillingProperties(
        new TbillingProperties.Jwt("test-secret", Duration.ofMinutes(15), Duration.ofDays(7)),
        new SuperAdmin("owner@tbilling.local", "ChangeMe123!"),
        new Jobs(
            new NetworkMonitor(false, Duration.ofSeconds(30), 300, 2),
            new ZeroRating(false)),
        new Daraja("", "", "", "", "", true),
        new Mikrotik("localhost", 8728, "admin", "", false),
        new Storage("http://localhost/uploads", 2_097_152),
        new Security(
            new Geofence(geofenceEnabled, blockUnknown, allowedCountries),
            new RateLimit(rateLimitEnabled, authPerMinute, 30, 240, 60)));
  }
}
