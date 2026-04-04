package com.printcraft.printcraft_backend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@RequiredArgsConstructor
@AllArgsConstructor
public class RegisterResponse {
    private String phoneNo;
    private String email;
    private String message;
    private LocalDateTime timestamp;
}
