package com.printcraft.printcraft_backend.order.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModificationPayloadDTO {

    private FieldChange size;

    private FieldChange thickness;

    private FieldChange frame;
}