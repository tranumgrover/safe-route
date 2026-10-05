package com.saferoute.repository;
import com.saferoute.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Incident> findByStatusOrderByCreatedAtDesc(Incident.Status status);
}
