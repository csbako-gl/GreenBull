package com.m4c1.greenbull.data;

import com.m4c1.greenbull.api_gateway.RestResponse;
import java.text.ParseException;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping({ "/battery_data" })
public class BatteryDataController {
    @Autowired
    BatteryDataService batteryDataService;

    @PutMapping("/add")
    public ResponseEntity<RestResponse<Void>> add(@RequestBody BatteryDataInputDto data) throws Exception {
        try {
            batteryDataService.addData(data);
        } catch (Exception e) {
            log.error("Error: ", e);
            return new ResponseEntity<>(RestResponse.<Void>builder()
                    .error(e.getMessage())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .build(), HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/get_all")
    RestResponse<List<BatteryDataOutputDto>> getAll(@RequestParam("device_id") Long deviceId) {
        List<BatteryDataOutputDto> data = batteryDataService.findByDeviceId(deviceId).stream().map(BatteryDataOutputDto::new).collect(Collectors.toList());
        return RestResponse.<List<BatteryDataOutputDto>>builder().data(data).build();
    }

    @GetMapping("/last")
    RestResponse<BatteryDataOutputDto> getLast(@RequestParam("device_id") Long deviceId) {
        Optional<BatteryData> data = batteryDataService.findLastByDeviceId(deviceId);
        return RestResponse.<BatteryDataOutputDto>builder().data(data.map(BatteryDataOutputDto::new).orElse(null)).build();
    }

    @GetMapping("/last_n")
    RestResponse<List<BatteryDataOutputDto>> getLastN(@RequestParam("device_id") Long deviceId, @RequestParam("count") Long count) {
        List<BatteryDataOutputDto> data = batteryDataService.findByDeviceIdLimited(deviceId, count).stream().map(BatteryDataOutputDto::new).collect(Collectors.toList());
        return RestResponse.<List<BatteryDataOutputDto>>builder().data(data).build();
    }

    @GetMapping("/get_all_from")
    RestResponse<List<BatteryDataOutputDto>> getAll(@RequestParam("device_id") Long deviceId, @RequestParam("from") Date from) throws ParseException {
        List<BatteryDataOutputDto> data = batteryDataService.findByDeviceIdFromDate(deviceId, from).stream().map(BatteryDataOutputDto::new).collect(Collectors.toList());
        return RestResponse.<List<BatteryDataOutputDto>>builder().data(data).build();
    }

    @GetMapping("/get_from_to")
    RestResponse<List<BatteryDataOutputDto>> getAll(
            @RequestParam("device_id") Long deviceId,
            @RequestParam("from") Date from,
            @RequestParam("to") Date to,
            @RequestParam(name = "limit", defaultValue = "1500") Long limit
    ) {
        List<BatteryDataOutputDto> data = batteryDataService.findByDeviceIdFromAndToDate(deviceId, from, to, limit).stream().map(BatteryDataOutputDto::new).collect(Collectors.toList());
        return RestResponse.<List<BatteryDataOutputDto>>builder().data(data).build();
    }
}
