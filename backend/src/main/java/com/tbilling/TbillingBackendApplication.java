package com.tbilling;

import com.tbilling.config.TbillingProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableCaching
@EnableScheduling
@SpringBootApplication
@EnableConfigurationProperties(TbillingProperties.class)
public class TbillingBackendApplication {
  public static void main(String[] args) {
    SpringApplication.run(TbillingBackendApplication.class, args);
  }
}
