package com.printcraft.printcraft_backend.auth.controller;

import com.printcraft.printcraft_backend.auth.dto.OtpRequest;
import com.printcraft.printcraft_backend.auth.dto.RegisterRequest;
import com.printcraft.printcraft_backend.auth.dto.RegisterResponse;
import com.printcraft.printcraft_backend.auth.dto.VerifyOtpRequest;
import com.printcraft.printcraft_backend.auth.service.AuthService;
import com.printcraft.printcraft_backend.user.domain.Role;
import com.printcraft.printcraft_backend.user.domain.User;
import com.printcraft.printcraft_backend.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
private final AuthService authService;
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        //call service layer method
        RegisterResponse registerResponse = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(registerResponse);
    }
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@Valid@RequestBody OtpRequest otpRequest){
        String message = authService.sendOTP(otpRequest);
        return ResponseEntity.ok(Map.of(
                "success",
                true,
                "message",
                 message
        ));
    }
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid@RequestBody VerifyOtpRequest verifyOtpRequest){
        String token = authService.verifyOTP(verifyOtpRequest);
        return ResponseEntity.ok(Map.of(
                "success",
                true,
                "token",
                token
        ));
    }
}
