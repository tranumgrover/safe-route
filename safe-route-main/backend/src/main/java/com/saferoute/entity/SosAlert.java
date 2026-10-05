package com.saferoute.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "sos_alerts")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SosAlert {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private Double latitude;
    private Double longitude;
    private String message;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Status { ACTIVE, RESOLVED }
}