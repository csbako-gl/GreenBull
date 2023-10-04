package com.m4c1.greenbull.data;

import com.m4c1.greenbull.api_gateway.RestResponse;
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

@RestController
@RequestMapping({ "/battery_data" })
public class BatteryDataController {
    @Autowired
    BatteryDataService batteryDataService;

    @PutMapping("/add")
    public RestResponse<Void> add(@RequestBody BatteryData data) {
        batteryDataService.addData(data);
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