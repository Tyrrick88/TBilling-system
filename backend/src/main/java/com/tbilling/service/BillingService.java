package com.tbilling.service;

import com.tbilling.api.ApiException;
import com.tbilling.api.Contracts.InvoiceRequest;
import com.tbilling.api.Contracts.InvoiceResponse;
import com.tbilling.api.ResponseMapper;
import com.tbilling.domain.Tenant;
import com.tbilling.domain.TenantInvoice;
import com.tbilling.repository.TenantInvoiceRepository;
import com.tbilling.repository.TenantRepository;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BillingService {
  private final TenantInvoiceRepository invoices;
  private final TenantRepository tenants;

  public BillingService(TenantInvoiceRepository invoices, TenantRepository tenants) {
    this.invoices = invoices;
    this.tenants = tenants;
  }

  @Transactional(readOnly = true)
  public List<InvoiceResponse> listInvoices() {
    return invoices.findTop100ByOrderByCreatedAtDesc().stream().map(ResponseMapper::invoice).toList();
  }

  @Transactional(readOnly = true)
  public List<InvoiceResponse> listTenantInvoices(UUID tenantId) {
    return invoices.findTop100ByTenantIdOrderByCreatedAtDesc(tenantId).stream()
        .map(ResponseMapper::invoice)
        .toList();
  }

  @Transactional
  public InvoiceResponse createInvoice(InvoiceRequest request) {
    Tenant tenant = tenants.findById(request.tenantId()).orElseThrow(() -> ApiException.notFound("Tenant not found"));
    TenantInvoice invoice = new TenantInvoice();
    invoice.tenant = tenant;
    invoice.amountKes = request.amountKes();
    invoice.dueDate = request.dueDate();
    invoice.invoiceNumber =
        "TB-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + tenant.slug.toUpperCase();
    return ResponseMapper.invoice(invoices.save(invoice));
  }
}
