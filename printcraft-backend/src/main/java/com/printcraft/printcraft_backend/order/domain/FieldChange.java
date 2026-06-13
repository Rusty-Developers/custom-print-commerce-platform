package com.printcraft.printcraft_backend.order.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor  // ← Jackson needs this to deserialize
@AllArgsConstructor // ← Builder needs this
@Data
@Builder
public class FieldChange {
    private String oldValue;
    private String newValue;
}
