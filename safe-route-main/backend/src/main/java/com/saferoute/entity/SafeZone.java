package com.saferoute.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "safe_zones")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SafeZone {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private Double latitude;
    private Double longitude;
    @Enumerated(EnumType.STRING) private ZoneType type;
    private Boolean isVerified = false;
    private Long addedBy;
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum ZoneType { POLICE, HOSPITAL, SHELTER, SHOP, TRANSPORT }
}
