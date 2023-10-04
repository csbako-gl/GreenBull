package com.m4c1.greenbull.settings;

import com.m4c1.greenbull.api_gateway.RestResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({ "/settings" })
@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600)
public class SettingsController {

    @Autowired
    private SettingsService settingsService;

    @GetMapping("/test")
    public RestResponse<String> test() {
        return RestResponse.<String>builder().data("OK").build();
    }

    @GetMapping("/get")
    public RestResponse<Settings> get() {
        return RestResponse.<Settings>builder().data(settingsService.getSettings()).build();
    }

    @PutMapping("/update")
    public RestResponse<Void> update(@RequestParam("settings") Settings settings) {
        settingsService.updateSettings(settings);
        return RestResponse.<Void>builder().build();
    }

}
