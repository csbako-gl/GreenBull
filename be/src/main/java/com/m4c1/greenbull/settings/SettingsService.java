package com.m4c1.greenbull.settings;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class SettingsService {

    @Autowired
    private SettingsRepository settingsRepository;

    private Settings getDefaultSettings() {
        return Settings.builder()
                .scale(3)
                .inputStyle(InputStyle.FILLED)
                .menuType(MenuType.OVERLAY)
                .rippleEffect(true)
                .theme("bootstrap4-dark-blue")
                .colorScheme(ColorScheme.DARK)
                .build();
    }

    public Settings getSettings() {
        // TODO get active user
        Long userID = 1L;
        return settingsRepository.findByUserId(userID).orElse(getDefaultSettings());
    }

    public void updateSettings(Settings settings) {
        Settings settingsToModify = getSettings();
        if(settings.getScale() != null) settingsToModify.setScale(settings.getScale());
        if(settings.getColorScheme() != null) settingsToModify.setColorScheme(settings.getColorScheme());
        if(settings.getRippleEffect() != null) settingsToModify.setRippleEffect(settings.getRippleEffect());
        if(settings.getTheme() != null) settingsToModify.setTheme(settings.getTheme());
        if(settings.getMenuType() != null) settingsToModify.setMenuType(settings.getMenuType());
        if(settings.getInputStyle() != null) settingsToModify.setInputStyle(settings.getInputStyle());
        settingsRepository.save(settingsToModify);
    }

    public String getVersion() {
        return System.getenv().get("GREENBULL_VERSION");
    }
}
