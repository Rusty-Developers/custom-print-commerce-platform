package com.printcraft.printcraft_backend.DeliveryTracking.ShipRocket.DTO;

import com.printcraft.printcraft_backend.DeliveryTracking.ShipRocket.ShiprocketOrderItem;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ShiprocketOrderRequestBrainDTO {
    private Long orderId;
    private String customerName;
    private  String addressLine;
    private String city;
    private Integer pinCode;
    private String state;
    private String phoneNo;
    //as may be 1/more than products so an array necessary --better list
    private List<ShiprocketOrderItem> orderItemsList;
    //basically it woudle be size of the List
    private BigDecimal subTotal;
}
