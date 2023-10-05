package com.m4c1.greenbull.data;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class BatteryDataDto {

    @JsonProperty("bms_id")
    private String bmsId;

    @JsonProperty("hex_data")
    private byte[] hexData;
}
