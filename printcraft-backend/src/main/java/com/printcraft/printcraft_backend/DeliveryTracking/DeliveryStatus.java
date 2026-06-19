package com.printcraft.printcraft_backend.DeliveryTracking;

public enum DeliveryStatus {
    CREATED(1),
    PACKED(2),
    SHIPPED(3),
    IN_TRANSIT(4),
    OUT_FOR_DELIVERY(5),
    DELIVERY_ATTEMPTED(5),   // same rank as OUT_FOR_DELIVERY — it's a retry loop, not forward progress
    DELIVERED(6),            // terminal, success
    FAILED_FINAL(6),         // terminal, failure
    RTO_INITIATED(6);        // terminal, ack-only

    private final int rank;

    DeliveryStatus(int rank) {
        this.rank = rank;
    }

    public int getRank() {
        return rank;
    }

    public boolean isTerminal() {
        return this == DELIVERED || this == FAILED_FINAL || this == RTO_INITIATED;
    }
}