package com.m4c1.greenbull.device;

import com.m4c1.greenbull.api_gateway.RestResponse;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({ "/device_type" })
public class DeviceTypeController {

    @Autowired
    DeviceTypeService deviceTypeService;

    @GetMapping("/get_all")
    RestResponse<List<DeviceType>> getAll() {
        final List<DeviceType> data = deviceTypeService.findAll();
        return RestResponse.<List<DeviceType>>builder().data(data).build();
    }
}
