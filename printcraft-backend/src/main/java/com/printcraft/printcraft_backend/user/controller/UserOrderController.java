package com.printcraft.printcraft_backend.user.controller;

import com.printcraft.printcraft_backend.Security.JwtUtil;
import com.printcraft.printcraft_backend.order.domain.Order;
import com.printcraft.printcraft_backend.order.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class UserOrderController {
    private final OrderService orderService;
   private  final  JwtUtil jwtUtil;
    public UserOrderController(OrderService orderService, JwtUtil jwtUtil) {
        this.orderService = orderService;
        this.jwtUtil = jwtUtil;
    }
//we should extract order by usuing phoneNO which will extracted from JWT-HEADER
    @GetMapping("/api/user/orders")
    public ResponseEntity<?> getMyOrders(@RequestHeader("Authorization") String authHeader){
        //extract phoneno from AUTHHEADER
        String token = authHeader.substring(7);
        String phoneNo = jwtUtil.extractPhone(token);
        List<Order> result = orderService.getMyOrders(phoneNo);
        return ResponseEntity.ok(result);
    }
}
