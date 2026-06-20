package com.printcraft.printcraft_backend.DeliveryTracking.ShipRocket.Controller;

import com.printcraft.printcraft_backend.DeliveryTracking.ShipRocket.ShiprocketAuthService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ShiprocketTestController {
    //injecting shiprockketservice
    private final ShiprocketAuthService shiprocketAuthService;

    public ShiprocketTestController(ShiprocketAuthService shiprocketAuthService) {
        this.shiprocketAuthService = shiprocketAuthService;
    }
    @GetMapping("/test/shiprocket/token")
    public String testToken() {
        return shiprocketAuthService.getValidToken();
    }
}
