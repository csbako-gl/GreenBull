package com.m4c1.greenbull.device;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceDto {
    private Long id;
    @JsonProperty("type_id")
    private long typeId;
    private String label;
    private String name;
    private String manufacture;
    private String description;
    @JsonProperty("bms_id")
    private String bmsId;
    @JsonProperty("other_data")
    private Map<String, String> otherData;
}
