package com.printcraft.printcraft_backend.address.service;

import com.printcraft.printcraft_backend.address.domain.Addresses;
import com.printcraft.printcraft_backend.address.dto.AddressRequestDTO;
import com.printcraft.printcraft_backend.address.dto.AddressResponseDTO;
import com.printcraft.printcraft_backend.address.repository.AddressRepository;
import com.printcraft.printcraft_backend.user.domain.User;
import com.printcraft.printcraft_backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressService(AddressRepository addressRepository, UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    // Save a new address for the authenticated user
    public AddressResponseDTO saveAddress(String phoneNo, AddressRequestDTO request) {
        User user = userRepository.findByphoneNo(phoneNo)
                .orElseThrow(() -> new RuntimeException("User not found for phone: " + phoneNo));

        Addresses address = Addresses.builder()
                .user(user)
                .fullName(request.getFullName())
                .phoneNo(request.getPhoneNo())
                .addressLine(request.getAddressLine())
                .landmark(request.getLandmark())
                .city(request.getCity())
                .state(request.getState())
                .pinCode(request.getPinCode())
                .isDefault(request.isDefault())
                .build();

        Addresses saved = addressRepository.save(address);
        return toDTO(saved);
    }

    // Get all addresses for the authenticated user
    public List<AddressResponseDTO> getMyAddresses(String phoneNo) {
        User user = userRepository.findByphoneNo(phoneNo)
                .orElseThrow(() -> new RuntimeException("User not found for phone: " + phoneNo));

        return addressRepository.findByUser(user)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Map Addresses entity → AddressResponseDTO
    private AddressResponseDTO toDTO(Addresses addr) {
        return AddressResponseDTO.builder()
                .id(addr.getId())
                .fullName(addr.getFullName())
                .phoneNo(addr.getPhoneNo())
                .addressLine(addr.getAddressLine())
                .landmark(addr.getLandmark())
                .city(addr.getCity())
                .state(addr.getState())
                .pinCode(addr.getPinCode())
                .isDefault(addr.isDefault())
                .build();
    }
}
