package com.saferoute.service;

import com.saferoute.dto.Dtos.IncidentRequest;
import com.saferoute.entity.*;
import com.saferoute.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service @RequiredArgsConstructor
public class IncidentService {
    private final IncidentRepository incidentRepo;
    private final UserRepository userRepo;

    public Incident reportIncident(IncidentRequest req, String email) {
        User user = userRepo.findByEmail(email).orElseThrow();
        Incident incident = Incident.builder()
                .user(user).latitude(req.getLatitude()).longitude(req.getLongitude())
                .description(req.getDescription())
                .incidentType(Incident.IncidentType.valueOf(req.getIncidentType()))
                .severity(Incident.Severity.valueOf(req.getSeverity())).build();
        return incidentRepo.save(incident);
    }

    public List<Incident> getUserIncidents(String email) {
        User user = userRepo.findByEmail(email).orElseThrow();
        return incidentRepo.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public List<Incident> getAllIncidents() {
        return incidentRepo.findAll();
    }

    public Incident updateStatus(Long id, String status) {
        Incident incident = incidentRepo.findById(id).orElseThrow();
        incident.setStatus(Incident.Status.valueOf(status));
        return incidentRepo.save(incident);
    }
}
