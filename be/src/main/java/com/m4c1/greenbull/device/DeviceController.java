package com.m4c1.greenbull.device;

import com.m4c1.greenbull.api_gateway.RestResponse;
import com.m4c1.greenbull.data.BatteryData;
import com.m4c1.greenbull.security.user.ActiveUserStore;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({ "/device" })
public class DeviceController {

    @Autowired
    DeviceService deviceService;

    @GetMapping("/get_all")
    RestResponse<List<Device>> getAll() {
        List<Device> data = deviceService.findAll();
        return RestResponse.<List<Device>>builder().data(data).build();
    }

    @GetMapping("/by_user")
    RestResponse<List<DeviceDto>> getByUser() {
        List<DeviceDto> data = deviceService.findByUser();
        return RestResponse.<List<DeviceDto>>builder().data(data).build();
    }

    @PutMapping("/add")
    RestResponse<Long> add(@RequestBody DeviceDto deviceDto) {
        Long id = deviceService.registerDevice(deviceDto);
        return RestResponse.<Long>builder().data(id).build();
    }
}
