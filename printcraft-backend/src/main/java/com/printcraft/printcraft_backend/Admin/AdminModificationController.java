package com.printcraft.printcraft_backend.Admin;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.printcraft.printcraft_backend.order.service.OrderNotication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminModificationController {

    // inject service
    private final OrderNotication orderNotication;

    public AdminModificationController(OrderNotication orderNotication) {
        this.orderNotication = orderNotication;
    }
    //here , actual updation after approval will reflected/saved into Order-DATABASE TABLE
    @PutMapping("/modifications/{id}/approve")
    public ResponseEntity<?> modifyOrderBYAdmin(@PathVariable long id) throws JsonProcessingException {
        orderNotication.approveModification(id);
        return ResponseEntity.ok("Modification approved");
    }
    //clearly show what decession has been pending
    @GetMapping("/modifications/pending")
    public ResponseEntity<?> getPendingToAdmin(){
        List<AdminModificationResponseDTO> allPendingOrdersModified = orderNotication.getPendingRequests();
        return ResponseEntity.of(Optional.ofNullable(allPendingOrdersModified));
    }
    //get exact modification for each id
    @GetMapping("/modifications/{id}")
    public ResponseEntity<?> getModificationById(@PathVariable long id){
     AdminModificationDetailsByIDDTO response =   orderNotication.getModificationDetailsByID(id);
        return ResponseEntity.ok(response);
    }
    //Reject API by Admin
    @PutMapping("/modifications/{id}/reject")
    public ResponseEntity<?> rejectionByAdmin(@PathVariable long id){
        orderNotication.rejectModification(id);
        return ResponseEntity.ok("Modification rejected");
    }
}