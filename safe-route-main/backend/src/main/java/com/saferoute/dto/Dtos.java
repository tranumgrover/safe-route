package com.saferoute.dto;

import com.saferoute.entity.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

public class Dtos {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
        private String phone;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AuthResponse {
        private String token;
        private String email;
        private String name;
        private String role;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class SosRequest {
        private Double latitude;
        private Double longitude;
        private String message;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class IncidentRequest {
        private Double latitude;
        private Double longitude;
        private String description;
        private String incidentType;
        private String severity;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class RouteRequest {
        private String startName;
        private String endName;
        private Double startLat;
        private Double startLng;
        private Double endLat;
        private Double endLng;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class SafeZoneRequest {
        private String name;
        private String description;
        private Double latitude;
        private Double longitude;
        private String type;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class EmergencyContactRequest {
        private String name;
        private String phone;
        private String relation;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RouteAnalysisResponse {
        private Double startLat;
        private Double startLng;
        private Double endLat;
        private Double endLng;
        private Double safetyScore;
        private List<SafeZone> nearbySafeZones;
        private List<DangerZone> nearbyDangerZones;
        private String recommendation;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UserProfileResponse {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private String role;
        private List<EmergencyContact> emergencyContacts;
    }
}
