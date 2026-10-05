package com.saferoute.controller;

import com.saferoute.dto.Dtos.*;
import com.saferoute.entity.*;
import com.saferoute.service.SafeRouteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/route") @RequiredArgsConstructor
public class RouteController {
    private final SafeRouteService routeService;

    @PostMapping("/analyze")
    public ResponseEntity<RouteAnalysisResponse> analyze(
            @RequestBody RouteRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(routeService.analyzeRoute(req, user.getUsername()));
    }

    @GetMapping("/history")
    public ResponseEntity<List<Route>> history(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(routeService.getUserRouteHistory(user.getUsername()));
    }

    @GetMapping("/safe-zones")
    public ResponseEntity<List<SafeZone>> allSafeZones() {
        return ResponseEntity.ok(routeService.getAllSafeZones());
    }

    @GetMapping("/danger-zones")
    public ResponseEntity<List<DangerZone>> allDangerZones() {
        return ResponseEntity.ok(routeService.getAllDangerZones());
    }

    @GetMapping("/nearby-safe")
    public ResponseEntity<List<SafeZone>> nearbySafe(@RequestParam double lat, @RequestParam double lng) {
        return ResponseEntity.ok(routeService.getNearbySafeZones(lat, lng));
    }

    @PostMapping("/safe-zones")
    public ResponseEntity<SafeZone> addSafeZone(
            @RequestBody SafeZoneRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(routeService.addSafeZone(req, user.getUsername()));
    }
}
