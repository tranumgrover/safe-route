package com.saferoute.controller;

import com.saferoute.dto.Dtos.IncidentRequest;
import com.saferoute.entity.Incident;
import com.saferoute.service.IncidentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/incidents") @RequiredArgsConstructor
public class IncidentController {
    private final IncidentService incidentService;

    @PostMapping
    public ResponseEntity<Incident> report(@RequestBody IncidentRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(incidentService.reportIncident(req, user.getUsername()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Incident>> my(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(incidentService.getUserIncidents(user.getUsername()));
    }

    @GetMapping
    public ResponseEntity<List<Incident>> all() {
        return ResponseEntity.ok(incidentService.getAllIncidents());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Incident> updateStatus(@PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(incidentService.updateStatus(id, status));
    }
}
