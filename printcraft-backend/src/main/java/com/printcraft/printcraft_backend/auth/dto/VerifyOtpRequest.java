package com.printcraft.printcraft_backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import validation.IndianPhoneNumber;

public class VerifyOtpRequest {
    //for verify OTP We need sended OTP AND PHONENO.
    @NotBlank
    @IndianPhoneNumber
    @Size(min = 10,max = 10)  //coz a phoneno without 10-digits is not valid
    private String phoneno;
    @NotBlank
    @Pattern(regexp = "^[0-9]{6}$")
    private String otp; //coz otp will be like 6 digits
}
