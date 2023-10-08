package com.m4c1.greenbull.data;

import com.m4c1.greenbull.api_gateway.RestException;
import com.m4c1.greenbull.device.Device;
import com.m4c1.greenbull.device.DeviceRepository;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
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
        ByteBuffer buffer = ByteBuffer.wrap(dataBytes);
        data.setPakfeszultseg(buffer.getInt());

        // pack_tolt
        byte[] dataBytes2 = Arrays.copyOfRange(receivedData, 117, 121);
        buffer = ByteBuffer.wrap(dataBytes2);
        data.setToltesszint(buffer.getInt());

        // terhel_tolt1
        byte[] dataBytes3 = Arrays.copyOfRange(receivedData, 109, 113);
        buffer = ByteBuffer.wrap(dataBytes3);
        data.setToltesmerites(buffer.getInt());

        // Ciklus
        byte[] dataBytes4 = Arrays.copyOfRange(receivedData, 126, 130);
        buffer = ByteBuffer.wrap(dataBytes4);
        data.setCiklusszam(buffer.getInt());

        // TODO ----------------------------------------------
        // hofok_6
        byte[] dataBytes_t6 = Arrays.copyOfRange(receivedData, 105, 109);
        buffer = ByteBuffer.wrap(dataBytes_t6);
        int hofok_6 = buffer.getInt() - 2730; //kelvin to Celsius

        // hofok_5
        byte[] dataBytes_t5 = Arrays.copyOfRange(receivedData, 101, 105);
        buffer = ByteBuffer.wrap(dataBytes_t5);
        int hofok_5 = buffer.getInt() - 2730;

        // hofok_4
        byte[] dataBytes_t4 = Arrays.copyOfRange(receivedData, 97, 101);
        buffer = ByteBuffer.wrap(dataBytes_t4);
        int hofok_4 = buffer.getInt() - 2730;

        //TODO data.setHibakod();
        //TODO data.setStatusz();
        //TODO data.setSzenzorok();

        // TODO ----------------------------------------------

        // hofok_3
        byte[] dataBytesT3 = Arrays.copyOfRange(receivedData, 93, 97);
        buffer = ByteBuffer.wrap(dataBytesT3);
        data.setSzenzorho2(buffer.getInt() - 2730);

        // hofok_2
        byte[] dataBytesT2 = Arrays.copyOfRange(receivedData, 89, 93);
        buffer = ByteBuffer.wrap(dataBytesT2);
        data.setSzenzorho1(buffer.getInt() - 2730);

        // hofok_1
        byte[] dataBytesT1 = Arrays.copyOfRange(receivedData, 85, 89);
        buffer = ByteBuffer.wrap(dataBytesT1);
        data.setBmshomerseklet(buffer.getInt() - 2730);

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

    private static int extractCellValue(byte[] receivedData, int startIndex) {
        byte[] dataBytes = Arrays.copyOfRange(receivedData, startIndex, startIndex + 4);
        ByteBuffer buffer = ByteBuffer.wrap(dataBytes);
        return buffer.getInt();
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
