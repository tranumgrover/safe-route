package com.saferoute.service;

import com.saferoute.dto.Dtos.*;
import com.saferoute.entity.*;
import com.saferoute.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service @RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepo;
    private final EmergencyContactRepository contactRepo;

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String email) {
        User user = userRepo.findByEmail(email).orElseThrow();
        List<EmergencyContact> contacts = contactRepo.findByUserId(user.getId());
        return UserProfileResponse.builder()
                .id(user.getId()).name(user.getName()).email(user.getEmail())
                .phone(user.getPhone()).role(user.getRole().name())
                .emergencyContacts(contacts).build();
    }

    @Transactional
    public EmergencyContact addContact(EmergencyContactRequest req, String email) {
        User user = userRepo.findByEmail(email).orElseThrow();
        EmergencyContact contact = EmergencyContact.builder()
                .user(user).name(req.getName())
                .phone(req.getPhone()).relation(req.getRelation()).build();
        return contactRepo.save(contact);
    }

    @Transactional
    public void deleteContact(Long contactId, String email) {
        User user = userRepo.findByEmail(email).orElseThrow();
        EmergencyContact contact = contactRepo.findById(contactId).orElseThrow();
        if (!contact.getUser().getId().equals(user.getId()))
            throw new RuntimeException("Unauthorized");
        contactRepo.deleteById(contactId);
    }

    @Transactional(readOnly = true)
    public List<EmergencyContact> getContacts(String email) {
        User user = userRepo.findByEmail(email).orElseThrow();
        return contactRepo.findByUserId(user.getId());
    }
}