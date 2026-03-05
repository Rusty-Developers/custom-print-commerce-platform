package com.printcraft.printcraft_backend.address.repository;

import com.printcraft.printcraft_backend.address.domain.Addresses;
import com.printcraft.printcraft_backend.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface AddressRepository extends JpaRepository<Addresses,Long> {
    //find user's address by usuerId
  List<Addresses> findByUserId(Long userId);
    //find user's address by user-Object itself.
    List<Addresses> findByUser(User user);

}
