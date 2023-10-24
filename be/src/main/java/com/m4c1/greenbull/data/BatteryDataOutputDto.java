package com.m4c1.greenbull.data;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BatteryDataOutputDto {

    private Long id;
    private Long deviceId;
    private Date date;
    private List<Integer> cell = new ArrayList<>();
    private List<Short> temperature = new ArrayList<>();
    private Integer pakfeszultseg;
    private Integer toltesmerites;
    private Integer toltesszint;
    private Integer ciklusszam;
    private Map<String, Object> other;

    public BatteryDataOutputDto (BatteryData data) {
        id = data.getId();
        deviceId = data.getDeviceId();
        date = data.getDate();
        cell = Arrays.stream(data.getCell()).toList();
        temperature = Arrays.asList(data.getTemperature());
        pakfeszultseg = data.getPakfeszultseg();
        toltesmerites = data.getToltesmerites();
        toltesszint = data.getToltesszint();
        ciklusszam = data.getCiklusszam();
        other = data.getOther();
    }
}
