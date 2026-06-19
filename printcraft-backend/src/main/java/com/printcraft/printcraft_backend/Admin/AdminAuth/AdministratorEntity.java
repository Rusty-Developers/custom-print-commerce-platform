package com.printcraft.printcraft_backend.Admin.AdminAuth;

import com.printcraft.printcraft_backend.user.domain.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_users")   //our DB - Table name
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdministratorEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;  // mkgroupprinting@gmail.com

    private String name;
    //for just record to safe -phoneno --BUT NO OTP
    @Column(unique = true)
    private String phoneNo;  // nullable — admin logs in via Google, not OTP
                             // stored for records only
    @Enumerated(EnumType.STRING)
    @Builder.Default                      //to make it no chnage /editable through request body or anything
    private Role role=Role.ADMIN;
    @Builder.Default
    private boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
