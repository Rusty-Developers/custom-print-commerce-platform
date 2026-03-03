package com.printcraft.printcraft_backend.address.domain;

import com.printcraft.printcraft_backend.user.domain.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.logging.log4j.util.Lazy;

@Entity
@Table(name = "addresses")   //our DB - Table name
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Addresses {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private  Long id;
    @ManyToOne(fetch = FetchType.LAZY) //A Person can have more than 1  address relationship(ER)
//    Why `FetchType.LAZY` — Understand This
//`EAGER` = every time you load an Address, JPA
//    **automatically** loads the full User object too. Wasteful.
//    If you load 100 addresses, you load 100 users unnecessarily.
//    LAZY` = User is only loaded **when you actually call** `address.getUser()`.
//    This is the correct default for all `@ManyToOne` relationships.
    @JoinColumn(name = "users.id") // column name in addresses table
    private User user;   // the actual object reference
    @Column(name = "fullName",nullable = false)
    private String fullName;
    @Column(nullable = false, unique = true)  // unique, not null
    private String phoneNo;
    @Column(nullable = false)
    private String addressLine;
    private String landmark; //landmark is optional,..
    @Column(nullable = false)
    private String city;
    @Column(nullable = false)
    private String state;
    @Column(nullable = false,length = 6)
    private Integer pinCode;
    @Builder.Default
    private boolean isDefault=false;
}
