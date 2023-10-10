package com.m4c1.greenbull.device;

import java.util.List;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class DeviceTypeService {

    @Autowired
    DeviceTypeRepository deviceTypeRepository;

    public long registerDeviceType(DeviceType deviceType) {
        deviceType = deviceTypeRepository.save(deviceType);
        return deviceType.getId();
    }

    public List<DeviceType> findAll() {
        Sort sort = Sort.by(Sort.Order.asc("name"));
        return deviceTypeRepository.findAll(sort);
    }
}
