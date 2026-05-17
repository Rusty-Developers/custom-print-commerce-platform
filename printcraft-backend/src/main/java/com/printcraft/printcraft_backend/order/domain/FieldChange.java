package com.printcraft.printcraft_backend.order.domain;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FieldChange {
    private String oldValue;
    private String newValue;
}
