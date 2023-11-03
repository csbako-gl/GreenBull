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

import static com.m4c1.greenbull.DataUtil.*;

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
    private Integer packTotal; // pakfeszultseg
    private Integer packCurrent; // toltesmerites
    private Integer packRemain; // toltesszint
    private Integer cycleTimes; // ciklusszam
    private Map<String, Object> other;

    public BatteryDataOutputDto (BatteryData data) {
        id = data.getId();
        deviceId = data.getDeviceId();
        date = data.getDate();
        cell = Arrays.stream(data.getCell()).toList();
        temperature = Arrays.asList(data.getTemperature());

        packTotal = data.getPackTotal();
        packCurrent = ushortToShort(data.getPackCurrent());
        packRemain = data.getPackRemain();
        cycleTimes = data.getCycleTimes();
        other = data.getOther();
    }
}
