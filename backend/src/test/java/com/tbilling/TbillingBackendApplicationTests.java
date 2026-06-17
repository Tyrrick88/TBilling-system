package com.tbilling;

import com.tbilling.repository.TenantRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@ActiveProfiles("test")
@SpringBootTest
class TbillingBackendApplicationTests {
  @Autowired TenantRepository tenants;

  @Test
  void contextLoadsAndSeedsDemoTenant() {
    assertThat(tenants.findBySlug("karurina-market")).isPresent();
  }
}
