package com.m4c1.greenbull.data;

import com.m4c1.greenbull.device.Device;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BatteryDataRepository extends JpaRepository<BatteryData, Long> {

    List<BatteryData> findByDeviceId(Long deviceId);

    @Query(value = "SELECT * FROM battery_data bd WHERE bd.device_id = :device_id order by bd.date desc LIMIT 1", nativeQuery = true)
    Optional<BatteryData> findLastByDeviceId(@Param("device_id") Long deviceId);

    @Query(value = "SELECT * from (SELECT * FROM battery_data bd WHERE bd.device_id = :device_id order by bd.date desc LIMIT :count) as b order by b.date asc", nativeQuery = true)
    List<BatteryData> findByDeviceIdLimited(@Param("device_id") Long deviceId, @Param("count") Long count);

    @Query(value = "SELECT * FROM battery_data bd WHERE bd.device_id = :device_id and bd.date >= :date_from order by bd.date asc", nativeQuery = true)
    List<BatteryData> findByDeviceIdFromDate(@Param("device_id") Long deviceId, @Param("date_from") Date dateFrom);

    @Query(value = "SELECT * FROM battery_data bd WHERE bd.device_id = :device_id and bd.date >= :date_from and bd.date <= :date_to order by bd.date asc", nativeQuery = true)
    List<BatteryData> findByDeviceIdFromAndToDate(
            @Param("device_id") Long deviceId,
            @Param("date_from") Date dateFrom,
            @Param("date_to") Date dateTo
    );
}
