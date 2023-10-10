package com.m4c1.greenbull.device;

import com.m4c1.greenbull.api_gateway.RestException;
import com.m4c1.greenbull.security.UserSecurityService;
import com.m4c1.greenbull.security.user.ActiveUserStore;
import com.m4c1.greenbull.security.user.User;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class DeviceService {

    @Autowired
    DeviceRepository deviceRepository;

    @Autowired
    UserSecurityService userSecurityService;

    @Autowired
    DeviceTypeRepository deviceTypeRepository;

    public long registerDevice(DeviceDto dto) {
        final User user = userSecurityService.getCurrentUser();
        Optional<DeviceType> deviceType = deviceTypeRepository.findById(dto.getTypeId());
        if (deviceType.isEmpty()) {
            throw new RestException("Error: invalid Type id:" + dto.getTypeId());
        }
        Optional<Device> oldDevice = deviceRepository.findByUserIdAndName(user.getId(), dto.getLabel());
        if (oldDevice.isPresent()) {
            throw new RestException("Error: There is another device with name:" + dto.getLabel());
        }
        oldDevice = deviceRepository.findByBmsId(dto.getBmsId());
        if (oldDevice.isPresent()) {
            throw new RestException("Error: There is another device with bms id:" + dto.getBmsId());
        }
        Device device = deviceRepository.save(Device.builder()
                .userId(user.getId())
                .bmsId(dto.getBmsId())
                .name(dto.getLabel())
                .typeId(dto.getTypeId())
                .build()
        );

        return device.getId();
    }

    public void updateDevice(Device device) {
        if (deviceRepository.findById(device.getId()).isEmpty() ) {
            log.error("device id {} does not exist. name: {}; user: {}", device.getId(), device.getName(), device.getUserId());
            return;
        }

        deviceRepository.save(device);
    }

    public List<Device> findAll() {
        return null;
        //activeUserStore.
    }

    public List<DeviceDto> findByUser() {
        User user = userSecurityService.getCurrentUser();
        if (user == null) {
            return null;
        }

        List<DeviceDto> deviceDtos = new ArrayList<>();
        List<Device> devices = deviceRepository.findByUserId(user.getId());
        devices.forEach(device -> {
            Optional<DeviceType> deviceType = deviceTypeRepository.findById(device.getTypeId());
            deviceType.ifPresent(type -> deviceDtos.add(DeviceDto.builder()
                    .id(device.getId())
                    .typeId(device.getTypeId())
                    .label(device.getName())
                    .name(type.getName())
                    .manufacture(type.getManufacture())
                    .description(type.getDescription())
                    .bmsId(device.getBmsId())
                    .otherData(type.getOtherData())
                    .build()));
        });

        return deviceDtos;
    }
}
