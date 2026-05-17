package com.printcraft.printcraft_backend.order.domain;

import lombok.Builder;
import lombok.Data;
@Data
@Builder
public class ModificationPayloadDTO {
    private FieldChange size;

    private FieldChange thickness;

    private FieldChange frame;
}
