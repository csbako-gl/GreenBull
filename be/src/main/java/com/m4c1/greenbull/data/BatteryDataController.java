package com.m4c1.greenbull.data;

import com.m4c1.greenbull.api_gateway.RestException;
import com.m4c1.greenbull.api_gateway.RestResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.beans.ExceptionListener;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import static com.m4c1.greenbull.ApplicationConstants.*;

@RestController
@RequestMapping({ "/battery_data" })
public class BatteryDataController {
    @Autowired
    BatteryDataService batteryDataService;

    @PutMapping("/add")
    public RestResponse<Void> add(@RequestBody BatteryDataDto data) throws Exception {
        try {
            batteryDataService.addData(data);
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
        return RestResponse.<Void>builder().build();
    }

    @PutMapping("/add2")
    public RestResponse<Void> add2(final HttpServletRequest request, @RequestBody final Optional<String> msg) throws Exception {
        String bmsId = request.getParameter("bms_id");
        String hexData = request.getParameter("hex_data");
        try {
            batteryDataService.addData(BatteryDataDto.builder()
                    .bmsId(bmsId)
                    .hexData(hexData.getBytes(StandardCharsets.US_ASCII))
                    .build());
        } catch (Exception e) {
            throw new RestException(e, "Error on add battery data:", bmsId, hexData);
        }
        return RestResponse.<Void>builder().build();
    }

    @GetMapping("/get_all")
    RestResponse<List<BatteryData>> getAll(@RequestParam("device_id") Long deviceId) {
        List<BatteryData> data = batteryDataService.findByDeviceId(deviceId);
        return RestResponse.<List<BatteryData>>builder().data(data).build();
    }

    @GetMapping("/last")
    RestResponse<BatteryData> getLast(@RequestParam("device_id") Long deviceId) {
        Optional<BatteryData> data = batteryDataService.findLastByDeviceId(deviceId);
        return RestResponse.<BatteryData>builder().data(data.orElse(null)).build();
    }

    @GetMapping("/last_n")
    RestResponse<List<BatteryData>> getLastN(@RequestParam("device_id") Long deviceId, @RequestParam("count") Long count) {
        List<BatteryData> data = batteryDataService.findByDeviceIdLimited(deviceId, count);
        return RestResponse.<List<BatteryData>>builder().data(data).build();
    }

    @GetMapping("/get_all_from")
    RestResponse<List<BatteryData>> getAll(@RequestParam("device_id") Long deviceId, @RequestParam("from") Date from) throws ParseException {
        List<BatteryData> data = batteryDataService.findByDeviceIdFromDate(deviceId, from);
        return RestResponse.<List<BatteryData>>builder().data(data).build();
    }

    @GetMapping("/get_all_from_to")
    RestResponse<List<BatteryData>> getAll(
            @RequestParam("device_id") Long deviceId,
            @RequestParam("from") Date from,
            @RequestParam("from") Date to
    ) {
        List<BatteryData> data = batteryDataService.findByDeviceIdFromAndToDate(deviceId, from, to);
        return RestResponse.<List<BatteryData>>builder().data(data).build();
    }
}
