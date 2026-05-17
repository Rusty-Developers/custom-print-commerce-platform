package com.printcraft.printcraft_backend.DeliveryTracking;

public enum DeliveryStatus {
    CREATED(1),    //order placed
    PACKED(2),  //ready in warehouse
    SHIPPED(3), //handed over to courier
    IN_TRANSIT(4),  //moving between hubs / cities 🚚
    OUT_FOR_DELIVERY(5),  //with delivery agent
    DELIVERED(6), //successfully delivered
    FAILED(6) //delivery attempt failed
    ;
    private final int rank;
    DeliveryStatus(int rank) {
        this.rank = rank;
    }
    //getter->>//  service class can call this
    public int getRank(){
        return rank;
    }
}
