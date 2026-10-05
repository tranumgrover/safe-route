package com.saferoute.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "routes")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Route {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne @JoinColumn(name = "user_id") private User user;
    private String startName;
    private String endName;
    private Double startLat;
    private Double startLng;
    private Double endLat;
    private Double endLng;
    private Double safetyScore;
    private LocalDateTime createdAt = LocalDateTime.now();
}
