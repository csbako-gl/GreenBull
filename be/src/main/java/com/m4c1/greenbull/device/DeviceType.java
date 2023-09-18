package com.m4c1.greenbull.device;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.util.Map;
import lombok.Data;
import org.hibernate.annotations.Type;

@Entity
@Data
@Table(name = "device_type",
        uniqueConstraints = {@UniqueConstraint(name = "UniqueNameAndManufacture", columnNames = {"name", "manufacture"})})
public class DeviceType {

    @Id
    @Column(unique = true, nullable = false)
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String manufacture;

    @Column(length = 2048, nullable = true)
    private String description;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, String> otherData;
}

