package com.m4c1.greenbull.device;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {

    @Override
    void delete(Device device);

    @Override
    void deleteById(Long id);

    Optional<Device> findByUserIdAndName(Long userId, String name);

    Optional<Device> findByBmsId(String bmsId);

    List<Device> findByUserId(Long userId);
}
