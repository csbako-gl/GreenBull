package com.m4c1.greenbull.device;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class DeviceService {

    @Autowired
    DeviceRepository deviceRepository;

    public long registerDevice(Device device) {
        device = deviceRepository.save(device);
        return device.getId();
    }

    public void updateDevice(Device device) {
        if (deviceRepository.findById(device.getId()).isEmpty() ) {
            log.error("device id {} does not exist. name: {}; user: {}", device.getId(), device.getName(), device.getUserId());
            return;
        }

        deviceRepository.save(device);
    }

}
