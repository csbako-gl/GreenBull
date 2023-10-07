package com.m4c1.greenbull.data;

import com.m4c1.greenbull.api_gateway.RestException;
import com.m4c1.greenbull.device.DeviceRepository;
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

        if(deviceRepository.findByBmsId(dto.getBmsId()).isEmpty()) {
            log.error("device Id does not exist: {}", dto.getBmsId());
            throw new RestException("device Id does not exist: " + dto.getBmsId());
        }

        if(dto.getHexData() == null) {
            log.error("hex data is null!");
            throw new RestException(("hex data is null!"));
        }

        BatteryData data = processDto(dto);
        if (data == null) {
            throw new RestException("device Id does not exist: " + dto.getBmsId());
        }

        Date date = new Date(System.currentTimeMillis());
        data.setDate(date);
        batteryDataRepository.save(data);
    }

    private BatteryData processDto(BatteryDataDto dto) {
        if (dto.getHexData() == null || dto.getHexData().length < 141 ) {
            return null;
        }

        BatteryData data = new BatteryData();
        byte[] receivedData = dto.getHexData();

        // pack_fesz
        byte[] dataBytes = Arrays.copyOfRange(receivedData, 113, 117);
        String hexString1 = new String(dataBytes, StandardCharsets.US_ASCII);
        data.setPakfeszultseg(Integer.parseInt(hexString1, 16));

        // pack_tolt
        byte[] dataBytes2 = Arrays.copyOfRange(receivedData, 117, 121);
        String hexString2 = new String(dataBytes2, StandardCharsets.US_ASCII);
        data.setToltesszint(Integer.parseInt(hexString2, 16));

        // terhel_tolt1
        byte[] dataBytes3 = Arrays.copyOfRange(receivedData, 109, 113);
        String hexString3 = new String(dataBytes3, StandardCharsets.US_ASCII);
        data.setToltesmerites(Integer.parseInt(hexString3, 16));

        // Ciklus
        byte[] dataBytes4 = Arrays.copyOfRange(receivedData, 126, 130);
        String hexString4 = new String(dataBytes4, StandardCharsets.US_ASCII);
        data.setCiklusszam(Integer.parseInt(hexString4, 16));

        // TODO ----------------------------------------------
        // hofok_6
        byte[] dataBytes_t6 = Arrays.copyOfRange(receivedData, 105, 109);
        String hexString_t6 = new String(dataBytes_t6, StandardCharsets.US_ASCII);
        int hofok_6 = Integer.parseInt(hexString_t6, 16) - 2730;
        double hofok6 = hofok_6 / 10.0;

        // hofok_5
        byte[] dataBytes_t5 = Arrays.copyOfRange(receivedData, 101, 105);
        String hexString_t5 = new String(dataBytes_t5, StandardCharsets.US_ASCII);
        int hofok_5 = Integer.parseInt(hexString_t5, 16) - 2730;
        double hofok5 = hofok_5 / 10.0;

        // hofok_4
        byte[] dataBytes_t4 = Arrays.copyOfRange(receivedData, 97, 101);
        String hexString_t4 = new String(dataBytes_t4, StandardCharsets.US_ASCII);
        int hofok_4 = Integer.parseInt(hexString_t4, 16) - 2730;
        double hofok4 = hofok_4 / 10.0;

        //TODO data.setHibakod();
        //TODO data.setStatusz();
        //TODO data.setSzenzorok();

        // TODO ----------------------------------------------

        // hofok_3
        byte[] dataBytesT3 = Arrays.copyOfRange(receivedData, 93, 97);
        String hexStringT3 = new String(dataBytesT3, StandardCharsets.US_ASCII);
        data.setSzenzorho2(Integer.parseInt(hexStringT3, 16) - 2730);

        // hofok_2
        byte[] dataBytesT2 = Arrays.copyOfRange(receivedData, 89, 93);
        String hexStringT2 = new String(dataBytesT2, StandardCharsets.US_ASCII);
        data.setSzenzorho1(Integer.parseInt(hexStringT2, 16) - 2730);

        // hofok_1
        byte[] dataBytesT1 = Arrays.copyOfRange(receivedData, 85, 89);
        String hexStringT1 = new String(dataBytesT1, StandardCharsets.US_ASCII);
        data.setBmshomerseklet(Integer.parseInt(hexStringT1, 16) - 2730);

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

        return null;
    }

    private static int extractCellValue(byte[] receivedData, int startIndex) {
        byte[] dataBytes = Arrays.copyOfRange(receivedData, startIndex, startIndex + 4);
        String hexString = new String(dataBytes, StandardCharsets.US_ASCII);
        return Integer.parseInt(hexString, 16);
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
