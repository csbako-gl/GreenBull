package com.m4c1.greenbull.device;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;

@Entity
@Data
@Table(name = "device",
        uniqueConstraints = {@UniqueConstraint(name = "UniqueNameAndUserId", columnNames = {"name", "userId"})})
public class Device {

    @Id
    @Column(unique = true, nullable = false)
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(unique = true, nullable = false)
    private String bmsId;

    @Column(nullable = false)
    private long userId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private long typeId;
}
