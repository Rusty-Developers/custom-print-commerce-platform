package com.printcraft.printcraft_backend.DeliveryTracking.ShipRocket.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
//Hey, just grab the token, company_id, and id.
// If Shiprocket sends extra stuff like emails or dates, just ignore it and don't crash.
@JsonIgnoreProperties(ignoreUnknown = true)
public class ShiprocketAuthResponse {
    public String token;
    @JsonProperty("company_id")
    private Long companyId;  //so that we can identify which company-courier is gonna take our delivery responsibility

    private Long id;
}
