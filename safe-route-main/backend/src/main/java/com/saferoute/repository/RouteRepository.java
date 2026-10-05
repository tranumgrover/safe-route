package com.saferoute.repository;
import com.saferoute.entity.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface RouteRepository extends JpaRepository<Route, Long> {
    List<Route> findByUserIdOrderByCreatedAtDesc(Long userId);
}
