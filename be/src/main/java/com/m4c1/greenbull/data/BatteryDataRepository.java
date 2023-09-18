package com.m4c1.greenbull.data;

import com.m4c1.greenbull.device.Device;
import java.util.Date;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BatteryDataRepository extends JpaRepository<BatteryData, Long> {

    List<BatteryData> findByDeviceId(Long deviceId);

    @Query(value = "SELECT * FROM battery_data bd WHERE bd.device_id = :device_id and bd.date >= :date_from", nativeQuery = true)
    List<BatteryData> findByDeviceIdFromDate(@Param("device_id") Long deviceId, @Param("date_from") Date dateFrom);

    @Query(value = "SELECT * FROM battery_data bd WHERE bd.device_id = :device_id and bd.date >= :date_from and bd.date <= :date_to", nativeQuery = true)
    List<BatteryData> findByDeviceIdFromAndToDate(
            @Param("device_id") Long deviceId,
            @Param("date_from") Date dateFrom,
            @Param("date_to") Date dateTo
    );
}
