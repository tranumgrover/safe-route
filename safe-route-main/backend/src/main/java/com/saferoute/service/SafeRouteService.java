package com.saferoute.service;

import com.saferoute.dto.Dtos.*;
import com.saferoute.entity.*;
import com.saferoute.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service @RequiredArgsConstructor
public class SafeRouteService {
    private final SafeZoneRepository safeZoneRepo;
    private final DangerZoneRepository dangerZoneRepo;
    private final RouteRepository routeRepo;
    private final UserRepository userRepo;

    public RouteAnalysisResponse analyzeRoute(RouteRequest req, String email) {
        double midLat = (req.getStartLat() + req.getEndLat()) / 2;
        double midLng = (req.getStartLng() + req.getEndLng()) / 2;

        List<SafeZone> safeZones = safeZoneRepo.findNearby(midLat, midLng, 2.0);
        List<DangerZone> dangerZones = dangerZoneRepo.findNearby(midLat, midLng, 2.0);

        double score = calculateSafetyScore(safeZones, dangerZones);
        String recommendation = getRecommendation(score);

        User user = userRepo.findByEmail(email).orElseThrow();
        Route route = Route.builder()
                .user(user).startName(req.getStartName()).endName(req.getEndName())
                .startLat(req.getStartLat()).startLng(req.getStartLng())
                .endLat(req.getEndLat()).endLng(req.getEndLng())
                .safetyScore(score).build();
        routeRepo.save(route);

        return RouteAnalysisResponse.builder()
                .startLat(req.getStartLat()).startLng(req.getStartLng())
                .endLat(req.getEndLat()).endLng(req.getEndLng())
                .safetyScore(score).nearbySafeZones(safeZones)
                .nearbyDangerZones(dangerZones).recommendation(recommendation).build();
    }

    private double calculateSafetyScore(List<SafeZone> safe, List<DangerZone> danger) {
        double score = 50.0;
        score += safe.size() * 8.0;
        for (DangerZone d : danger) {
            switch (d.getSeverity()) {
                case HIGH -> score -= 20.0;
                case MEDIUM -> score -= 10.0;
                case LOW -> score -= 5.0;
            }
        }
        return Math.max(0, Math.min(100, score));
    }

    private String getRecommendation(double score) {
        if (score >= 75) return "SAFE: This route has good safety coverage. Proceed normally.";
        if (score >= 50) return "MODERATE: Exercise caution. Share your location with a trusted contact.";
        return "UNSAFE: High risk route. Consider an alternative or travel with company.";
    }

    public List<SafeZone> getNearbySafeZones(double lat, double lng) {
        return safeZoneRepo.findNearby(lat, lng, 3.0);
    }

    public List<DangerZone> getNearbyDangerZones(double lat, double lng) {
        return dangerZoneRepo.findNearby(lat, lng, 3.0);
    }

    public List<SafeZone> getAllSafeZones() {
        return safeZoneRepo.findAll();
    }

    public List<DangerZone> getAllDangerZones() {
        return dangerZoneRepo.findAll();
    }

    public SafeZone addSafeZone(SafeZoneRequest req, String email) {
        User user = userRepo.findByEmail(email).orElseThrow();
        SafeZone zone = SafeZone.builder()
                .name(req.getName()).description(req.getDescription())
                .latitude(req.getLatitude()).longitude(req.getLongitude())
                .type(SafeZone.ZoneType.valueOf(req.getType()))
                .addedBy(user.getId()).build();
        return safeZoneRepo.save(zone);
    }

    public List<Route> getUserRouteHistory(String email) {
        User user = userRepo.findByEmail(email).orElseThrow();
        return routeRepo.findByUserIdOrderByCreatedAtDesc(user.getId());
    }
}
