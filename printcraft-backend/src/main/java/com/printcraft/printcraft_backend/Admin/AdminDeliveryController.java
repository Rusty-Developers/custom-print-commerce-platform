package com.printcraft.printcraft_backend.Admin;

import com.printcraft.printcraft_backend.DeliveryTracking.DeliveryServiceEngine;
import com.printcraft.printcraft_backend.DeliveryTracking.dto.UpdateDeliveryStatusRequestDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/delivery")
public class AdminDeliveryController {
//injecting delivertstatengine
    private final DeliveryServiceEngine deliveryServiceEngine;

    public AdminDeliveryController(DeliveryServiceEngine deliveryServiceEngine) {
        this.deliveryServiceEngine = deliveryServiceEngine;
    }
    @PatchMapping("/updateStatus")
    public ResponseEntity<?> updateStatus(@RequestBody UpdateDeliveryStatusRequestDTO requestDTO){
        deliveryServiceEngine.updateDeliveryStatus(requestDTO.getTrackingId(),requestDTO.getNewStatus(),requestDTO.getLocation(), LocalDateTime.now());
        return ResponseEntity.ok(Map.of("success", true));
    }

}
