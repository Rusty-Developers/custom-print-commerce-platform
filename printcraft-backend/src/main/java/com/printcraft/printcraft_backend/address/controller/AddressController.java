package com.printcraft.printcraft_backend.address.controller;

import com.printcraft.printcraft_backend.Security.JwtUtil;
import com.printcraft.printcraft_backend.address.dto.AddressRequestDTO;
import com.printcraft.printcraft_backend.address.dto.AddressResponseDTO;
import com.printcraft.printcraft_backend.address.service.AddressService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class AddressController {

    private final AddressService addressService;
    private final JwtUtil jwtUtil;

    public AddressController(AddressService addressService, JwtUtil jwtUtil) {
        this.addressService = addressService;
        this.jwtUtil = jwtUtil;
    }

    // POST /api/user/addresses  — save a new address for the logged-in user
    @PostMapping("/api/user/addresses")
    public ResponseEntity<AddressResponseDTO> saveAddress(
            @RequestBody AddressRequestDTO request,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);
        String phoneNo = jwtUtil.extractPhone(token);
        AddressResponseDTO saved = addressService.saveAddress(phoneNo, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // GET /api/user/addresses  — return all addresses for the logged-in user
    @GetMapping("/api/user/addresses")
    public ResponseEntity<List<AddressResponseDTO>> getMyAddresses(
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);
        String phoneNo = jwtUtil.extractPhone(token);
        List<AddressResponseDTO> addresses = addressService.getMyAddresses(phoneNo);
        return ResponseEntity.ok(addresses);
    }
}
