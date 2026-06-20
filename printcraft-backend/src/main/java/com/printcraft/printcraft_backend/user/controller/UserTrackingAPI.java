package com.printcraft.printcraft_backend.user.controller;
import com.printcraft.printcraft_backend.DeliveryTracking.dto.UserTrackingDTO;
import com.printcraft.printcraft_backend.user.service.UserTrackingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserTrackingAPI {
    private final UserTrackingService userTrackingService;
    //Constructor injection
    public UserTrackingAPI(UserTrackingService userTrackingService) {
        this.userTrackingService = userTrackingService;
    }

    //get details by orderId
    @GetMapping("/tracking/{orderId}")
    public ResponseEntity<UserTrackingDTO> getUserTracking(@PathVariable Long orderId){
        UserTrackingDTO userTrackingDTO =
                userTrackingService.getByOrderId(orderId);

        return ResponseEntity.ok(userTrackingDTO);
    }
}
