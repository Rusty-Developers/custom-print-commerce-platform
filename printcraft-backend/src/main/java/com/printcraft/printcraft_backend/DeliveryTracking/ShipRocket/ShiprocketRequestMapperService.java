package com.printcraft.printcraft_backend.DeliveryTracking.ShipRocket;

import com.printcraft.printcraft_backend.DeliveryTracking.ShipRocket.DTO.ShiprocketOrderRequestBrainDTO;
import com.printcraft.printcraft_backend.order.domain.Order;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.List;

@Component
public class ShiprocketRequestMapperService {
        public ShiprocketOrderRequestBrainDTO map(Order order) {
            // build the item first (exactly one, since Order has a single Product)
            //building-> ShiprocketOrderItem [list of all order-items[]
            ShiprocketOrderItem item = ShiprocketOrderItem.builder()
                    .name(order.getProduct().getProductName())
                    .sku("SKU-" + order.getProduct().getId())
                    .units(1)
                    .sellingPrice(order.getFinalPrice())
                    .build();
            // then build and return the DTO using .builder()
            return ShiprocketOrderRequestBrainDTO.builder()
                    .orderId(order.getId())
                    .customerName(order.getAddress().getFullName())
                    .addressLine(order.getAddress().getAddressLine())
                    .city(order.getAddress().getCity())
                    .pinCode(order.getAddress().getPinCode())
                    .state(order.getAddress().getState())
                    .phoneNo(order.getAddress().getPhoneNo())
                    .orderItemsList(List.of(item))
                    .subTotal(order.getFinalPrice())
                    .build();


        }

}
