package com.saferoute.repository;
import com.saferoute.entity.EmergencyContact;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, Long> {
    List<EmergencyContact> findByUserId(Long userId);
}
