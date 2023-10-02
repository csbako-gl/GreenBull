package com.m4c1.greenbull.device;

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
    private long typeId;
    private String label;
    private String name;
    private String manufacture;
    private String description;
    private Map<String, String> otherData;
}
