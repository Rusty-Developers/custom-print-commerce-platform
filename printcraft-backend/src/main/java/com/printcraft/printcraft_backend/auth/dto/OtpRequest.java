package com.printcraft.printcraft_backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import validation.IndianPhoneNumber;

@Data
public class OtpRequest {
    @NotBlank
    @IndianPhoneNumber
    @Size(min = 10,max = 10)  //coz a phoneno without 10-digits is not valid
    private String phoneno;
}
