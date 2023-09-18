package com.m4c1.greenbull.data;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.Date;
import lombok.Data;

@Entity
@Data
@Table(name = "battery_data")
public class BatteryData {
    @Id
    @Column(unique = true, nullable = false)
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private Long deviceId;


    private Date date;

    private Integer c1;
    private Integer c2;
    private Integer c3;
    private Integer c4;
    private Integer c5;
    private Integer c6;
    private Integer c7;
    private Integer c8;
    private Integer c9;
    private Integer c10;
    private Integer c11;
    private Integer c12;
    private Integer c13;
    private Integer c14;
    private Integer c15;
    private Integer c16;

    private Integer bmshomerseklet;
    private Integer szenzorho1;
    private Integer szenzorho2;
    private Integer pakfeszultseg;
    private Integer toltesmerites;
    private Integer toltesszint;
    private Integer szenzorok;
    private Integer ciklusszam;
    private Integer hibakod;
    private Integer statusz;
    private Integer data1;
    private Integer data2;
}
