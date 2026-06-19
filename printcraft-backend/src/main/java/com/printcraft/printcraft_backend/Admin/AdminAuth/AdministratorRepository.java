package com.printcraft.printcraft_backend.Admin.AdminAuth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdministratorRepository extends JpaRepository<AdministratorEntity,Long> {
    Optional<AdministratorEntity> findByEmail(String email);
    boolean existsByEmail(String email);
}
