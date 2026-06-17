package com.tbilling.api;

import com.tbilling.api.Contracts.ZeroRatingSyncResponse;
import com.tbilling.service.ZeroRatingService;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/network")
public class NetworkController {
  private final ZeroRatingService zeroRatingService;

  public NetworkController(ZeroRatingService zeroRatingService) {
    this.zeroRatingService = zeroRatingService;
  }

  @PutMapping("/zero-rated-ips")
  public ZeroRatingSyncResponse syncZeroRatedIps() {
    return zeroRatingService.syncCurrentTenant();
  }
}
