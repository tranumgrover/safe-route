package com.saferoute.repository;
import com.saferoute.entity.SafeZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
public interface SafeZoneRepository extends JpaRepository<SafeZone, Long> {
    @Query("SELECT s FROM SafeZone s WHERE (6371 * acos(cos(radians(:lat)) * cos(radians(s.latitude)) * cos(radians(s.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(s.latitude)))) < :radiusKm")
    List<SafeZone> findNearby(double lat, double lng, double radiusKm);
    List<SafeZone> findByIsVerifiedTrue();
}
