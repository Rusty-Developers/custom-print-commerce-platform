package com.printcraft.printcraft_backend.DeliveryTracking.Controller;

import com.printcraft.printcraft_backend.DeliveryTracking.DeliveryServiceEngine;
import com.printcraft.printcraft_backend.DeliveryTracking.dto.UserTrackingDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DeliveryTrackingController {
    private final DeliveryServiceEngine deliveryServiceEngine;

    public DeliveryTrackingController(DeliveryServiceEngine deliveryServiceEngine) {
        this.deliveryServiceEngine = deliveryServiceEngine;
    }

    @GetMapping("/api/tracking/{trackingId}")
    public ResponseEntity<UserTrackingDTO> getTrackingIdDetails(@PathVariable String trackingId){
        UserTrackingDTO userTrackingDTO = deliveryServiceEngine.getAllDetailsByTrackingId(trackingId);
        return ResponseEntity.ok(userTrackingDTO);
    }
}
