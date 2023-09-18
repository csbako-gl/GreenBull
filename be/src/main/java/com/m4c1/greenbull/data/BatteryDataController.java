package com.m4c1.greenbull.data;

import com.m4c1.greenbull.api_gateway.RestResponse;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
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

    @GetMapping("/get_all_from")
    RestResponse<List<BatteryData>> getAll(@RequestParam("device_id") Long deviceId, @RequestParam("from") String from) throws ParseException {
        SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
        List<BatteryData> data = batteryDataService.findByDeviceIdFromDate(deviceId, df.parse(from));
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
