package com.printcraft.printcraft_backend.order.domain;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ModificationRequestDTO {
    private String newSize;

    private String newThickness;

    private String newFrame;
}
