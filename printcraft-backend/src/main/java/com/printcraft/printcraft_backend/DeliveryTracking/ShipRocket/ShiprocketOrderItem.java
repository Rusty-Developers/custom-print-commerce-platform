
package com.printcraft.printcraft_backend.DeliveryTracking.ShipRocket;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ShiprocketOrderItem {
    private String name;
//    SKU = "Stock Keeping Unit" — a unique code identifying exactly which product variant this is
//            (like a product ID string, e.g. "SKU-42" or "PRINT-A4-FRAMED"). Also just text.
private String sku;
    private Integer units;
    private BigDecimal sellingPrice;
}
