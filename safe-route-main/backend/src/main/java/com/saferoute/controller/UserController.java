package com.saferoute.controller;

import com.saferoute.dto.Dtos.*;
import com.saferoute.entity.EmergencyContact;
import com.saferoute.entity.User;
import com.saferoute.repository.EmergencyContactRepository;
import com.saferoute.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepo;
    private final EmergencyContactRepository contactRepo;
    private final PasswordEncoder passwordEncoder;

    // ─── GET /api/users/profile ───────────────────────────────────────────────
    // Called by: userApi.profile() in api.js
    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<EmergencyContact> contacts = contactRepo.findByUserId(user.getId());

        return ResponseEntity.ok(UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .emergencyContacts(contacts)
                .build());
    }

    // ─── PUT /api/users/profile ───────────────────────────────────────────────
    // Called by: userApi.updateProfile(data) in api.js
    // Saves updated name/phone to MySQL users table
    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> updates) {

        User user = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.containsKey("name") && !updates.get("name").isBlank()) {
            user.setName(updates.get("name"));
        }
        if (updates.containsKey("phone")) {
            user.setPhone(updates.get("phone"));
        }
        // Allow password update if provided
        if (updates.containsKey("password") && !updates.get("password").isBlank()) {
            user.setPassword(passwordEncoder.encode(updates.get("password")));
        }

        userRepo.save(user); // ✅ saves to MySQL users table

        List<EmergencyContact> contacts = contactRepo.findByUserId(user.getId());

        return ResponseEntity.ok(UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .emergencyContacts(contacts)
                .build());
    }

    // ─── GET /api/users/contacts ──────────────────────────────────────────────
    // Called by: userApi.contacts() in api.js
    @GetMapping("/contacts")
    public ResponseEntity<List<EmergencyContact>> getContacts(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(contactRepo.findByUserId(user.getId()));
    }

    // ─── POST /api/users/contacts ─────────────────────────────────────────────
    // Called by: userApi.addContact(data) in api.js
    // Saves new emergency contact to MySQL emergency_contacts table
    @PostMapping("/contacts")
    public ResponseEntity<EmergencyContact> addContact(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody EmergencyContactRequest req) {

        User user = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        EmergencyContact contact = EmergencyContact.builder()
                .user(user)
                .name(req.getName())
                .phone(req.getPhone())
                .relation(req.getRelation())
                .build();

        return ResponseEntity.ok(contactRepo.save(contact)); // ✅ saves to MySQL
    }

    // ─── DELETE /api/users/contacts/{id} ─────────────────────────────────────
    // Called by: userApi.deleteContact(id) in api.js
    @DeleteMapping("/contacts/{id}")
    public ResponseEntity<Map<String, String>> deleteContact(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        EmergencyContact contact = contactRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact not found"));

        // Security: only delete your own contacts
        if (!contact.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Not authorized to delete this contact"));
        }

        contactRepo.deleteById(id); // ✅ deletes from MySQL
        return ResponseEntity.ok(Map.of("message", "Contact deleted successfully"));
    }
}