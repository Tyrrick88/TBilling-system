package com.tbilling.api;

import com.tbilling.api.Contracts.MpesaCallbackRequest;
import com.tbilling.api.Contracts.PaymentStatusResponse;
import com.tbilling.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {
  private final PaymentService paymentService;

  public PaymentController(PaymentService paymentService) {
    this.paymentService = paymentService;
  }

  @GetMapping("/status/{checkoutRequestId}")
  public PaymentStatusResponse status(@PathVariable String checkoutRequestId) {
    return paymentService.status(checkoutRequestId);
  }

  @PostMapping("/callback")
  public PaymentStatusResponse callback(@Valid @RequestBody MpesaCallbackRequest request) {
    return paymentService.handleCallback(request);
  }
}
