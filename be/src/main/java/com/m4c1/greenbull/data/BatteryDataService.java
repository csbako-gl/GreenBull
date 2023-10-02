package com.m4c1.greenbull.data;

import com.m4c1.greenbull.device.DeviceRepository;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class BatteryDataService {

    @Autowired
    BatteryDataRepository batteryDataRepository;

    @Autowired
    DeviceRepository deviceRepository;

    public void addData(BatteryData data) {
        if(deviceRepository.findById(data.getDeviceId()).isEmpty()) {
            log.error("device Id does not exist: {}", data);
            return;
        }

        // TODO lehet meg kellene kérdezni hogy küldi-e az időt vagy nekem kell feltölteni?
        Date date = new Date(System.currentTimeMillis());
        data.setDate(date);

        batteryDataRepository.save(data);
    }

    public List<BatteryData> findByDeviceId(Long deviceId) {
        return batteryDataRepository.findByDeviceId(deviceId);
    }

    public Optional<BatteryData> findLastByDeviceId(Long deviceId) {
        return batteryDataRepository.findLastByDeviceId(deviceId);
    }

    public List<BatteryData> findByDeviceIdLimited(Long deviceId, Long count) {
        return batteryDataRepository.findByDeviceIdLimited(deviceId, count);
    }

    public List<BatteryData> findByDeviceIdFromDate(Long deviceId, Date dateFrom) {
        return batteryDataRepository.findByDeviceIdFromDate(deviceId, dateFrom);
    }

    public List<BatteryData> findByDeviceIdFromAndToDate(Long deviceId, Date dateFrom, Date dateTo) {
        return batteryDataRepository.findByDeviceIdFromAndToDate(deviceId, dateFrom, dateTo);
    }
}
