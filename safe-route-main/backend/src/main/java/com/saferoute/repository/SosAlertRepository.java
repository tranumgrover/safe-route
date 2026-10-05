package com.saferoute.repository;
import com.saferoute.entity.SosAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface SosAlertRepository extends JpaRepository<SosAlert, Long> {
    List<SosAlert> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<SosAlert> findByStatus(SosAlert.Status status);
}
