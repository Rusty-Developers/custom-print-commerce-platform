package com.printcraft.printcraft_backend.order.controller;

import com.printcraft.printcraft_backend.DeliveryTracking.dto.UserTrackingDTO;
import com.printcraft.printcraft_backend.Security.JwtUtil;
import com.printcraft.printcraft_backend.order.domain.Order;
import com.printcraft.printcraft_backend.order.dto.CreateOrderRequest;
import com.printcraft.printcraft_backend.order.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class OrderController {
    private final OrderService orderService;
    private final JwtUtil jwtUtil;

    public OrderController(OrderService orderService, JwtUtil jwtUtil) {
        this.orderService = orderService;
        this.jwtUtil = jwtUtil;
    }
    //create Order controller
    @PostMapping("/api/createOrders")
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request,@RequestHeader("Authorization") String authHeader){
       //extract phoneno
        String token = authHeader.substring(7);
        String phoneno = jwtUtil.extractPhone(token);
       Order order =  orderService.createOrder(request,phoneno);
        return  ResponseEntity.ok(order);
    }
    //Order Tracking
    @GetMapping("/api/orders/{orderId}/tracking")
    public ResponseEntity<UserTrackingDTO> getTrackingByOrderId(@PathVariable Long orderId) {
        UserTrackingDTO userTrackingDTO = orderService.getTrackingByOrderIdMethod(orderId);
        return ResponseEntity.ok(userTrackingDTO);
    }
}
