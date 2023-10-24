package com.m4c1.greenbull.data;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BatteryDataInputDto {

    @JsonProperty("bms_id")
    private String bmsId;

    @JsonProperty("hex_data")
    private byte[] hexData;
}
