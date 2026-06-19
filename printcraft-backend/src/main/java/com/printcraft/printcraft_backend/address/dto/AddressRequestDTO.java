package com.printcraft.printcraft_backend.address.dto;

import lombok.Data;

@Data
public class AddressRequestDTO {
    private String fullName;
    private String phoneNo;
    private String addressLine;
    private String landmark;   // optional
    private String city;
    private String state;
    private Integer pinCode;
    private boolean isDefault = false;
}
