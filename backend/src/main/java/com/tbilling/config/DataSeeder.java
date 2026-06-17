package com.tbilling.config;

import com.tbilling.domain.Enums.PackageStatus;
import com.tbilling.domain.Enums.UserRole;
import com.tbilling.domain.InternetPackage;
import com.tbilling.domain.Tenant;
import com.tbilling.domain.UserAccount;
import com.tbilling.repository.InternetPackageRepository;
import com.tbilling.repository.TenantRepository;
import com.tbilling.repository.UserAccountRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Configuration
public class DataSeeder {
  private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

  @Bean
  CommandLineRunner seedData(
      TenantRepository tenants,
      UserAccountRepository users,
      InternetPackageRepository packages,
      PasswordEncoder passwordEncoder,
      TbillingProperties properties) {
    return args -> seed(tenants, users, packages, passwordEncoder, properties);
  }

  @Transactional
  void seed(
      TenantRepository tenants,
      UserAccountRepository users,
      InternetPackageRepository packages,
      PasswordEncoder passwordEncoder,
      TbillingProperties properties) {
    if (!users.existsByEmailIgnoreCase(properties.superAdmin().email())) {
      UserAccount owner = new UserAccount();
      owner.name = "TBilling Owner";
      owner.email = properties.superAdmin().email().toLowerCase(Locale.ROOT);
      owner.passwordHash = passwordEncoder.encode(properties.superAdmin().password());
      owner.role = UserRole.ROLE_SUPER_ADMIN;
      users.save(owner);
      log.info("Seeded super admin {}", owner.email);
    }

    Tenant demo =
        tenants
            .findBySlug("karurina-market")
            .orElseGet(
                () -> {
                  Tenant tenant = new Tenant();
                  tenant.name = "Karurina Market";
                  tenant.businessName = "Karurina Market Hotspot";
                  tenant.slug = "karurina-market";
                  tenant.locationName = "Karurina Market, Embu";
                  tenant.supportPhone = "+254700000000";
                  tenant.supportWhatsapp = "+254700000000";
                  tenant.mpesaPaybill = "123456";
                  tenant.monthlyFee = BigDecimal.valueOf(5000);
                  return tenants.save(tenant);
                });

    if (!users.existsByEmailIgnoreCase("admin@karurina.local")) {
      UserAccount admin = new UserAccount();
      admin.tenant = demo;
      admin.name = "Karurina Admin";
      admin.email = "admin@karurina.local";
      admin.passwordHash = passwordEncoder.encode("ChangeMe123!");
      admin.role = UserRole.ROLE_CLIENT_ADMIN;
      users.save(admin);
    }

    if (packages.findByTenantIdOrderBySortOrderAscCreatedAtAsc(demo.id).isEmpty()) {
      List<InternetPackage> defaults =
          List.of(
              packageOf(demo, "Starter", 2, 60, 20, 0, false, false),
              packageOf(demo, "Day Pass", 5, 1440, 80, 1, true, true),
              packageOf(demo, "Stream Max", 10, 360, 120, 2, true, true));
      packages.saveAll(defaults);
    }
  }

  private InternetPackage packageOf(
      Tenant tenant,
      String name,
      int speedMbps,
      int minutes,
      int price,
      int sortOrder,
      boolean calls,
      boolean streaming) {
    InternetPackage internetPackage = new InternetPackage();
    internetPackage.tenant = tenant;
    internetPackage.name = name;
    internetPackage.speedMbps = speedMbps;
    internetPackage.durationMinutes = minutes;
    internetPackage.priceKes = BigDecimal.valueOf(price);
    internetPackage.sortOrder = sortOrder;
    internetPackage.status = PackageStatus.ACTIVE;
    internetPackage.whatsappCallsAllowed = calls;
    internetPackage.streamingAllowed = streaming;
    return internetPackage;
  }
}
