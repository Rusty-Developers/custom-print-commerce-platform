package com.printcraft.printcraft_backend.address.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressResponseDTO {
    private Long id;
    private String fullName;
    private String phoneNo;
    private String addressLine;
    private String landmark;
    private String city;
    private String state;
    private Integer pinCode;
    private boolean isDefault;
}
