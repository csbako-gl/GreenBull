package com.m4c1.greenbull.device;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DeviceTypeRepository  extends JpaRepository<DeviceType, Long> {

    @Override
    void delete(DeviceType deviceType);

    @Override
    void deleteById(Long id);

    /*@Query(value = "SELECT * FROM device_type dt WHERE dt.manufacture = :manufacture and dt.name = :name", nativeQuery = true)
    DeviceType findByNameAndManufacture(@Param("name") String name, @Param("manufacture") String manufacture);*/
    Optional<DeviceType> findByNameAndManufacture(String name, String manufacture);
}
