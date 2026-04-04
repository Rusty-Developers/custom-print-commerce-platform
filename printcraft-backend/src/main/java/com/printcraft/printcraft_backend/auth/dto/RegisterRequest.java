package com.printcraft.printcraft_backend.auth.dto;

import jakarta.validation.constraints.*;
import lombok.Data;


@Data
public class RegisterRequest {
    @NotBlank
    @Size(min = 5,max = 255)
    private String name;
    @NotBlank
    @Pattern(regexp = "^[6-9][0-9]{9}$")
    @Size(min = 10,max = 10,message = "Phone number must be exactly 10 digits")  //coz a phoneno without 10-digits is not valid
    private String phoneno;
    @NotBlank
    @Email(message = "Invalid email format")
    private String email;

}
