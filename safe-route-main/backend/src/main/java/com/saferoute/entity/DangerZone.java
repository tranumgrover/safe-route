package com.saferoute.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "danger_zones")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DangerZone {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Double latitude;
    private Double longitude;
    private Integer radiusMeters = 100;
    @Enumerated(EnumType.STRING) private Severity severity = Severity.MEDIUM;
    private String description;
    private Integer reportCount = 1;
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Severity { LOW, MEDIUM, HIGH }
}
