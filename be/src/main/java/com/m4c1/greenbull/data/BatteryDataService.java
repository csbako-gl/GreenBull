package com.m4c1.greenbull.data;

import com.m4c1.greenbull.api_gateway.RestException;
import com.m4c1.greenbull.device.Device;
import com.m4c1.greenbull.device.DeviceRepository;
import com.m4c1.greenbull.security.UserSecurityService;
import com.m4c1.greenbull.security.user.User;
import java.util.ArrayList;
import java.util.Arrays;
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

    @Autowired
    UserSecurityService userSecurityService;

    public void addData(BatteryDataInputDto dto) {

        if (dto == null) {
            throw new RestException("Error battery data is null!");
        }

        Device device = deviceRepository.findByBmsId(dto.getBmsId()).orElse(null);
        if(device == null) {
            log.error("device Id does not exist: {}", dto.getBmsId());
            throw new RestException("device Id does not exist: " + dto.getBmsId());
        }

        if(dto.getHexData() == null) {
            log.error("hex data is null!");
            throw new RestException(("hex data is null!"));
        }

        BatteryData data = processDtoNew(dto);
        if (data == null) {
            throw new RestException("can not process battery data dto: " + dto.toString());
        }

        Date date = new Date(System.currentTimeMillis());
        data.setDate(date);
        data.setDeviceId(device.getId());
        batteryDataRepository.save(data);
    }

    private BatteryData processDtoNew(BatteryDataInputDto dto) {
        if (dto.getHexData() == null || dto.getHexData().length < 141 ) {
            throw new RestException("hex data is null or to small: " + (dto.getHexData() == null ? "null" : dto.getHexData().length));
        }

        BatteryData data = new BatteryData();
        byte[] receivedData = dto.getHexData();
        byte[] dataBytes;

        // 0 first byte is 7E (SOI)
        // 1-2 version: that is veision 25H， V2.5
        // 3-4 address 2 bytes (ADR， the battery address is 0)
        // 5-6 CID1 2 bytes
        // 7-8 RTN 2 bytes
        // 9-12 Length, (LENGTH， F07A， LENID is 07AH， DATAINFO length is 122 ， LCHKSUM is FH)
        // 13-14 (INFOFLAG is 00H。 other information is DATAI)
        // 15-16 (COMMAND， as ADR， 00H)

        // 17-18 battery cell count (battery cell number M， is 10H， that has 16 cell)
        dataBytes = Arrays.copyOfRange(receivedData, 17, 19);
        final int cellCount = getIntFromAscii2Bytes(dataBytes);

        if (cellCount == 0) {
            throw new RestException("cell voltage count is 0");
        }

        data.setCell(new Integer[cellCount]);
        // cell voltage if 19-82 (19 - 19+(cellcount*4)) first cell voltage： 0D37H， that’s 3383mV
        for (int cell = 0; cell < cellCount; cell++) {
            data.getCell()[cell] = extractCellValue(receivedData, 19 + cell * 4);
        }
        int index = 19 + cellCount * 4;

        // (83-84) temperature number N， 06H， has 6 temperatures
        dataBytes = Arrays.copyOfRange(receivedData, index, index + 2);
        final int tempCount = getIntFromAscii2Bytes(dataBytes);
        index += 2;

        if (tempCount != 0) {
            data.setTemperature(new Short[tempCount]);
            // (85-108)  4 bytes first temperature： 0BAAH， that’s 2986， 25.6℃
            for (int temp = 0; temp < tempCount; temp++) {
                dataBytes = Arrays.copyOfRange(receivedData, index + temp * 4, index + (temp + 1) * 4);
                data.getTemperature()[temp] = (short)(getIntFromAscii4Bytes(dataBytes) - 2730);
            }
            index += (tempCount * 4);
        }

        // (109-112) PACK current， 0000H， unit10mA， range： -327.68A-+327.67A
        dataBytes = Arrays.copyOfRange(receivedData, index, index + 4);
        data.setToltesmerites(getIntFromAscii4Bytes(dataBytes));
        index += 4;

        // (113-116) PACK total voltage， CF94H that’s 53.140V
        dataBytes = Arrays.copyOfRange(receivedData, index, index + 4);
        data.setPakfeszultseg(getIntFromAscii4Bytes(dataBytes));
        index += 4;

        // (117-120) PACK remain capacity， 06D6H that’s 17.50AH
        dataBytes = Arrays.copyOfRange(receivedData, index, index + 4);
        data.setToltesszint(getIntFromAscii4Bytes(dataBytes));
        index += 4;

        // (121-122) user define number P， 03H
        dataBytes = Arrays.copyOfRange(receivedData, index, index + 2);
        final int userDataCount = getIntFromAscii2Bytes(dataBytes);
        index += 2;

        if (userDataCount >= 3) {
            // (123-126) PACK full capacity， 1388H that’s 50.00AH
            // dataBytes = Arrays.copyOfRange(receivedData, index, index + 4);
            index += 4;

            // (127-130) cycle times
            dataBytes = Arrays.copyOfRange(receivedData, index, index + 4);
            data.setCiklusszam(getIntFromAscii4Bytes(dataBytes));
            index += 4;

            // (131-133) PACK design capacity， 1388H that’s 50.00AH
            // dataBytes = Arrays.copyOfRange(receivedData, index, index + 4);
            index += 4;
        }

        return data;
    }

    private int getIntFromAscii4Bytes(byte[] buffer) {
        return  Integer.parseInt(String.valueOf(
                (char)buffer[0]) +
                (char)(buffer[1]) +
                (char)(buffer[2]) +
                (char)(buffer[3]), 16);
    }

    private int getIntFromAscii2Bytes(byte[] buffer) {
        return  Integer.parseInt(String.valueOf(
                (char)buffer[0]) +
                (char)(buffer[1]), 16);
    }

    private int extractCellValue(byte[] receivedData, int startIndex) {
        byte[] dataBytes = Arrays.copyOfRange(receivedData, startIndex, startIndex + 4);
        return getIntFromAscii4Bytes(dataBytes);
    }

    public List<BatteryData> findByDeviceId(Long deviceId) {
        return batteryDataRepository.findByDeviceId(deviceId);
    }

    public Optional<BatteryData> findLastByDeviceId(Long deviceId) {
        if (deviceId != null && deviceId > 0) {
            return batteryDataRepository.findLastByDeviceId(deviceId);
        }

        User user = userSecurityService.getCurrentUser();
        List<Device> devices = deviceRepository.findByUserId(user.getId());
        if (!devices.isEmpty()) {
            return batteryDataRepository.findLastByDeviceId(devices.get(0).getId());
        }

        return Optional.of(new BatteryData());
    }

    public List<BatteryData> findByDeviceIdLimited(Long deviceId, Long count) {
        if (deviceId != null && deviceId > 0) {
            return batteryDataRepository.findByDeviceIdLimited(deviceId, count);
        }
        User user = userSecurityService.getCurrentUser();
        List<Device> devices = deviceRepository.findByUserId(user.getId());
        if (!devices.isEmpty()) {
            return batteryDataRepository.findByDeviceIdLimited(devices.get(0).getId(), count);
        }
        return new ArrayList<>();
    }

    public List<BatteryData> findByDeviceIdFromDate(Long deviceId, Date dateFrom) {
        return batteryDataRepository.findByDeviceIdFromDate(deviceId, dateFrom);
    }

    public List<BatteryData> findByDeviceIdFromAndToDate(Long deviceId, Date dateFrom, Date dateTo, Long limit) {
        List<BatteryData> batteryData = batteryDataRepository.findByDeviceIdFromAndToDate(deviceId, dateFrom, dateTo);
        if (batteryData.size() <= limit) {
            return batteryData;
        }

        int step = (int)((batteryData.size() + limit - 1) / limit);
        List<BatteryData> avgData = new ArrayList<>();
        for (int i = 0; i < batteryData.size(); i+= step) {
            int count = i + step < batteryData.size()
                    ? step
                    : batteryData.size() - i;
            BatteryData avg = new BatteryData(batteryData.subList(i, i + count));
            avgData.add(avg);
        }

        return avgData;
    }
}
