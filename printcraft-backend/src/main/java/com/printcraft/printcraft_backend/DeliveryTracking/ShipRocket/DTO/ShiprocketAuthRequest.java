package com.printcraft.printcraft_backend.DeliveryTracking.ShipRocket.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ShiprocketAuthRequest {
    private String email;
    private String password; // this is needed to send outbound request login to shiprocket
}
