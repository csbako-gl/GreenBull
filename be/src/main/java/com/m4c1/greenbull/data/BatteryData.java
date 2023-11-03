package com.m4c1.greenbull.data;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "battery_data")
public class BatteryData {
    @Id
    @Column(unique = true, nullable = false)
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private Long deviceId;
    private Date date;
    @Column(columnDefinition = "INTEGER[]")
    private Integer[] cell;
    @Column(columnDefinition = "SMALLINT[]")
    private Short[] temperature;
    private Integer packTotal;
    private Integer packCurrent;
    private Integer packRemain;
    private Integer cycleTimes;
    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> other;

    private void init() {
        packTotal = 0;
        packCurrent = 0;
        packRemain = 0;
        cycleTimes = 0;
    }

    public BatteryData(List<BatteryData> others) {
        init();
        this.id = others.get(0).id;
        this.deviceId = others.get(0).deviceId;

        List<Integer> intTemperature = new ArrayList<>();
        long timestamp = 0;
        for (BatteryData otherData : others) {
            timestamp += otherData.date.getTime();
            if (this.cell == null || this.cell.length == 0) {
                this.cell = Arrays.copyOf(otherData.cell, otherData.cell.length);
            } else {
                for (int i = 0; i < otherData.getCell().length; i++) {
                    this.cell[i] += Optional.ofNullable(otherData.cell[i]).orElse(0);
                }
            }

            if (intTemperature.isEmpty()) {
                intTemperature.addAll(Arrays.stream(otherData.temperature).map(v -> (int)v).toList());
            } else {
                for (int i = 0; i < otherData.getTemperature().length; i++) {
                    if (otherData.temperature[i] != null) {
                        intTemperature.set(i, intTemperature.get(i) + otherData.temperature[i]);
                    }
                }
            }

            this.packTotal += Optional.ofNullable(otherData.packTotal).orElse(0);
            this.packCurrent += Optional.ofNullable(otherData.packCurrent).orElse(0);
            this.packRemain += Optional.ofNullable(otherData.packRemain).orElse(0);
            this.cycleTimes += Optional.ofNullable(otherData.cycleTimes).orElse(0);
        }

        for (int i = 0; i < this.cell.length; i++) {
            this.cell[i] /= others.size();
        }

        this.temperature = new Short[intTemperature.size()];
        for (int i = 0; i < intTemperature.size(); i++) {
            this.temperature[i] = (short)(intTemperature.get(i)/others.size());
        }

        this.date = new Date(timestamp/others.size());
        this.packTotal /= others.size();
        this.packCurrent /= others.size();
        this.packRemain /= others.size();
        this.cycleTimes /= others.size();
    }
}
