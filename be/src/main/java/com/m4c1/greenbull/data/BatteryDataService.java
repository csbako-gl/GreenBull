package com.m4c1.greenbull.data;

import com.m4c1.greenbull.api_gateway.RestException;
import com.m4c1.greenbull.device.Device;
import com.m4c1.greenbull.device.DeviceRepository;
import com.m4c1.greenbull.security.UserSecurityService;
import com.m4c1.greenbull.security.user.User;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
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

    public void addData(BatteryDataDto dto) {

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

        BatteryData data = processDto(dto);
        if (data == null) {
            throw new RestException("can not process battery data dto: " + dto.toString());
        }

        Date date = new Date(System.currentTimeMillis());
        data.setDate(date);
        data.setDeviceId(device.getId());
        batteryDataRepository.save(data);
    }

    private BatteryData processDto(BatteryDataDto dto) {
        if (dto.getHexData() == null || dto.getHexData().length < 141 ) {
            throw new RestException("hex data is null or to small: " + (dto.getHexData() == null ? "null" : dto.getHexData().length));
        }

        BatteryData data = new BatteryData();
        byte[] receivedData = dto.getHexData();

        // pack_fesz
        byte[] dataBytes = Arrays.copyOfRange(receivedData, 113, 117);
        data.setPakfeszultseg(getIntFromAscii4Bytes(dataBytes));

        // pack_tolt
        dataBytes = Arrays.copyOfRange(receivedData, 117, 121);
        data.setToltesszint(getIntFromAscii4Bytes(dataBytes));

        // terhel_tolt1
        dataBytes = Arrays.copyOfRange(receivedData, 109, 113);
        data.setToltesmerites(getIntFromAscii4Bytes(dataBytes));

        // Ciklus
        dataBytes = Arrays.copyOfRange(receivedData, 126, 130);
        data.setCiklusszam(getIntFromAscii4Bytes(dataBytes));

        // TODO ----------------------------------------------
        dataBytes = Arrays.copyOfRange(receivedData, 105, 109);
        int hofok_6 = getIntFromAscii4Bytes(dataBytes) - 2730; //kelvin to Celsius

        // hofok_5
        dataBytes = Arrays.copyOfRange(receivedData, 101, 105);
        int hofok_5 = getIntFromAscii4Bytes(dataBytes) - 2730;

        // hofok_4
        dataBytes = Arrays.copyOfRange(receivedData, 97, 101);
        int hofok_4 = getIntFromAscii4Bytes(dataBytes) - 2730;

        //TODO data.setHibakod();
        //TODO data.setStatusz();
        //TODO data.setSzenzorok();

        // TODO ----------------------------------------------

        // hofok_3
        dataBytes = Arrays.copyOfRange(receivedData, 93, 97);
        data.setSzenzorho2(getIntFromAscii4Bytes(dataBytes) - 2730);

        // hofok_2
        dataBytes = Arrays.copyOfRange(receivedData, 89, 93);
        data.setSzenzorho1(getIntFromAscii4Bytes(dataBytes) - 2730);

        // hofok_1
        dataBytes = Arrays.copyOfRange(receivedData, 85, 89);
        data.setBmshomerseklet(getIntFromAscii4Bytes(dataBytes) - 2730);

        // Cella értékek
        data.setC1( extractCellValue(receivedData, 19));
        data.setC2( extractCellValue(receivedData, 23));
        data.setC3( extractCellValue(receivedData, 27));
        data.setC4( extractCellValue(receivedData, 31));
        data.setC5( extractCellValue(receivedData, 35));
        data.setC6( extractCellValue(receivedData, 39));
        data.setC7( extractCellValue(receivedData, 43));
        data.setC8( extractCellValue(receivedData, 47));
        data.setC9( extractCellValue(receivedData, 51));
        data.setC10( extractCellValue(receivedData, 55));
        data.setC11( extractCellValue(receivedData, 59));
        data.setC12( extractCellValue(receivedData, 63));
        data.setC13( extractCellValue(receivedData, 67));
        data.setC14( extractCellValue(receivedData, 71));
        data.setC15( extractCellValue(receivedData, 75));
        data.setC16( extractCellValue(receivedData, 79));

        return data;
    }

    private int getIntFromAscii4Bytes(byte[] buffer) {
        return  Integer.parseInt(String.valueOf(
                (char)buffer[0]) +
                (char)(buffer[1]) +
                (char)(buffer[2]) +
                (char)(buffer[3]), 16);

                /*(buffer[0] << 24) |
                ((buffer[1] & 0xFF) << 16) |
                ((buffer[2] & 0xFF) << 8) |
                (buffer[3] & 0xFF);*/
    }

    private int getIntFromAscii2Bytes(byte[] buffer) {
        return  ((buffer[0] & 0xFF) << 8) |
                (buffer[1] & 0xFF);
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

    public List<BatteryData> findByDeviceIdFromAndToDate(Long deviceId, Date dateFrom, Date dateTo) {
        return batteryDataRepository.findByDeviceIdFromAndToDate(deviceId, dateFrom, dateTo);
    }
}
