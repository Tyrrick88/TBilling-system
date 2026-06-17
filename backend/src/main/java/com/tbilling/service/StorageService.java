package com.tbilling.service;

import com.tbilling.api.ApiException;
import com.tbilling.api.Contracts.LogoUploadResponse;
import com.tbilling.config.TbillingProperties;
import com.tbilling.domain.Tenant;
import com.tbilling.tenant.TenantGuard;
import java.time.Instant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class StorageService {
  private final TbillingProperties properties;
  private final TenantGuard tenantGuard;

  public StorageService(TbillingProperties properties, TenantGuard tenantGuard) {
    this.properties = properties;
    this.tenantGuard = tenantGuard;
  }

  @Transactional
  public LogoUploadResponse uploadLogo(MultipartFile file) {
    if (file.isEmpty()) {
      throw ApiException.badRequest("Logo file is required");
    }
    if (file.getSize() > properties.storage().maxLogoBytes()) {
      throw ApiException.badRequest("Logo file is larger than 2MB");
    }
    String contentType = file.getContentType() == null ? "" : file.getContentType();
    if (!contentType.startsWith("image/")) {
      throw ApiException.badRequest("Logo must be an image");
    }

    Tenant tenant = tenantGuard.requireTenant();
    String extension = contentType.substring(contentType.indexOf('/') + 1).replace("svg+xml", "svg");
    String logoUrl =
        properties.storage().publicBaseUrl()
            + "/"
            + tenant.slug
            + "/logo-"
            + Instant.now().toEpochMilli()
            + "."
            + extension;
    tenant.logoUrl = logoUrl;
    return new LogoUploadResponse(logoUrl, "Logo accepted. Configure R2/S3 adapter to persist bytes.");
  }
}
