package com.printcraft.printcraft_backend.user.repository;

import com.printcraft.printcraft_backend.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User,Long> {
    Optional<User> findByphoneNo(String phoneNo);
    Optional<User> findByEmail(String email);
    //check
     boolean existsByphoneNo(String phoneNo);
    boolean existsByEmail(String email);

    @Override
    Optional<User> findById(Long aLong);
}
