package com.saferoute.repository;
import com.saferoute.entity.DangerZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
public interface DangerZoneRepository extends JpaRepository<DangerZone, Long> {
    @Query("SELECT d FROM DangerZone d WHERE (6371 * acos(cos(radians(:lat)) * cos(radians(d.latitude)) * cos(radians(d.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(d.latitude)))) < :radiusKm")
    List<DangerZone> findNearby(double lat, double lng, double radiusKm);
}
