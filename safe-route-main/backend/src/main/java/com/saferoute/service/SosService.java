package com.saferoute.service;

import com.saferoute.dto.Dtos.SosRequest;
import com.saferoute.entity.*;
import com.saferoute.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service @RequiredArgsConstructor
public class SosService {
    private final SosAlertRepository sosRepo;
    private final UserRepository userRepo;
    private final EmergencyContactRepository contactRepo;

    public SosAlert triggerSos(SosRequest req, String email) {
        User user = userRepo.findByEmail(email).orElseThrow();
        SosAlert alert = SosAlert.builder()
                .user(user).latitude(req.getLatitude())
                .longitude(req.getLongitude()).message(req.getMessage()).build();
        SosAlert saved = sosRepo.save(alert);
        // In production: send SMS/email to emergency contacts
        List<EmergencyContact> contacts = contactRepo.findByUserId(user.getId());
        // contacts.forEach(c -> smsService.send(c.getPhone(), buildSosMessage(user, req)));
        return saved;
    }

    public SosAlert resolveSos(Long id, String email) {
        SosAlert alert = sosRepo.findById(id).orElseThrow();
        alert.setStatus(SosAlert.Status.RESOLVED);
        return sosRepo.save(alert);
    }

    public List<SosAlert> getUserAlerts(String email) {
        User user = userRepo.findByEmail(email).orElseThrow();
        return sosRepo.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public List<SosAlert> getActiveAlerts() {
        return sosRepo.findByStatus(SosAlert.Status.ACTIVE);
    }
}
