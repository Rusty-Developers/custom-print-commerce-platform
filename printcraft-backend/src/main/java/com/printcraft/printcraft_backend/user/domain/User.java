package com.printcraft.printcraft_backend.user.domain;

import com.printcraft.printcraft_backend.user.domain.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")   //our DB - Table name
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
@Id
@GeneratedValue(strategy = GenerationType.SEQUENCE,
        generator = "user_seq")
@SequenceGenerator(name = "user_seq",
        sequenceName = "user_sequence",
        allocationSize = 50)  //HELP IN BATCH-INSERT,-Hibernate pre-allocates 50 IDs —>faster but gaps appear in IDs.
    private Long id;   //THIS IS FOR OUR INTERNAL DB RECORD -SAFE
    //FOR PUBLIC API EXPOSURE..
    @Column(nullable = false,unique = true)
    private UUID publicId;
    //    publicId should auto-generate on creation --> if new user create publicId would be created
    @PrePersist
    protected  void onCreate(){
        if(publicId==null){
            publicId=UUID.randomUUID();
        }
    }
    @Column(name = "name")
    private String name;
    @Column(nullable = false, unique = true)  // unique, not null
    private String phoneNo;
    @Column(nullable = false,unique = true)
    private String email;
    private String passwordHash;
    @Enumerated(EnumType.STRING)
    private Role role;
//    isActive should default to true.
    @Builder.Default
    private boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

}
