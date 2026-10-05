package com.saferoute.controller;

import com.saferoute.dto.Dtos.SosRequest;
import com.saferoute.entity.SosAlert;
import com.saferoute.service.SosService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/sos") @RequiredArgsConstructor
public class SosController {
    private final SosService sosService;

    @PostMapping("/trigger")
    public ResponseEntity<SosAlert> trigger(@RequestBody SosRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(sosService.triggerSos(req, user.getUsername()));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<SosAlert> resolve(@PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(sosService.resolveSos(id, user.getUsername()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<SosAlert>> my(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(sosService.getUserAlerts(user.getUsername()));
    }

    @GetMapping("/active")
    public ResponseEntity<List<SosAlert>> active() {
        return ResponseEntity.ok(sosService.getActiveAlerts());
    }
}
