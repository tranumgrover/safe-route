package com.saferoute.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "incidents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private Double latitude;
    private Double longitude;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "incident_type")
    private IncidentType incidentType;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Severity severity = Severity.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.OPEN;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum IncidentType {
        HARASSMENT,
        STALKING,
        ASSAULT,
        SUSPICIOUS,
        OTHER,
        THEFT,
        UNSAFE_AREA,
        POOR_LIGHTING
    }

    public enum Severity { LOW, MEDIUM, HIGH }
    public enum Status   { OPEN, RESOLVED, INVESTIGATING }
}