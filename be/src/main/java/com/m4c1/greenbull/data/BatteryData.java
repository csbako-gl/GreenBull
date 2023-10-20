package com.m4c1.greenbull.data;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    private void init() {
        c1 = 0;
        c2 = 0;
        c3 = 0;
        c4 = 0;
        c5 = 0;
        c6 = 0;
        c7 = 0;
        c8 = 0;
        c9 = 0;
        c10 = 0;
        c11 = 0;
        c12 = 0;
        c13 = 0;
        c14 = 0;
        c15 = 0;
        c16 = 0;
        bmshomerseklet = 0;
        szenzorho1 = 0;
        szenzorho2 = 0;
        pakfeszultseg = 0;
        toltesmerites = 0;
        toltesszint = 0;
        szenzorok = 0;
        ciklusszam = 0;
        hibakod = 0;
        statusz = 0;
        data1 = 0;
        data2 = 0;
    }

    public BatteryData(List<BatteryData> others) {
        init();
        this.id = others.get(0).id;
        this.deviceId = others.get(0).deviceId;

        long timestamp = 0;
        for (BatteryData other : others) {
            timestamp += other.date.getTime();
            this.c1 += Optional.ofNullable(other.c1).orElse(0);
            this.c2 += Optional.ofNullable(other.c2).orElse(0);
            this.c3 += Optional.ofNullable(other.c3).orElse(0);
            this.c4 += Optional.ofNullable(other.c4).orElse(0);
            this.c5 += Optional.ofNullable(other.c5).orElse(0);
            this.c6 += Optional.ofNullable(other.c6).orElse(0);
            this.c7 += Optional.ofNullable(other.c7).orElse(0);
            this.c8 += Optional.ofNullable(other.c8).orElse(0);
            this.c9 += Optional.ofNullable(other.c9).orElse(0);
            this.c10 += Optional.ofNullable(other.c10).orElse(0);
            this.c11 += Optional.ofNullable(other.c11).orElse(0);
            this.c12 += Optional.ofNullable(other.c12).orElse(0);
            this.c13 += Optional.ofNullable(other.c13).orElse(0);
            this.c14 += Optional.ofNullable(other.c14).orElse(0);
            this.c15 += Optional.ofNullable(other.c15).orElse(0);
            this.c16 += Optional.ofNullable(other.c16).orElse(0);
            this.bmshomerseklet += Optional.ofNullable(other.bmshomerseklet).orElse(0);
            this.szenzorho1 += Optional.ofNullable(other.szenzorho1).orElse(0);
            this.szenzorho2 += Optional.ofNullable(other.szenzorho2).orElse(0);
            this.pakfeszultseg += Optional.ofNullable(other.pakfeszultseg).orElse(0);
            this.toltesmerites += Optional.ofNullable(other.toltesmerites).orElse(0);
            this.toltesszint += Optional.ofNullable(other.toltesszint).orElse(0);
            this.szenzorok += Optional.ofNullable(other.szenzorok).orElse(0);
            this.ciklusszam += Optional.ofNullable(other.ciklusszam).orElse(0);
            this.hibakod = hibakod != 0 ? hibakod : Optional.ofNullable(other.hibakod).orElse(0);
            this.statusz = statusz != 0 ? statusz : Optional.ofNullable(other.statusz).orElse(0);
            this.data1 += Optional.ofNullable(other.data1).orElse(0);
            this.data2 += Optional.ofNullable(other.data2).orElse(0);
        }

        this.date = new Date(timestamp/others.size());
        this.c1 /= others.size();
        this.c2 /= others.size();
        this.c3 /= others.size();
        this.c4 /= others.size();
        this.c5 /= others.size();
        this.c6 /= others.size();
        this.c7 /= others.size();
        this.c8 /= others.size();
        this.c9 /= others.size();
        this.c10 /= others.size();
        this.c11 /= others.size();
        this.c12 /= others.size();
        this.c13 /= others.size();
        this.c14 /= others.size();
        this.c15 /= others.size();
        this.c16 /= others.size();
        this.bmshomerseklet /= others.size();
        this.szenzorho1 /= others.size();
        this.szenzorho2 /= others.size();
        this.pakfeszultseg /= others.size();
        this.toltesmerites /= others.size();
        this.toltesszint /= others.size();
        this.szenzorok /= others.size();
        this.ciklusszam /= others.size();
        //this.hibakod /= others.size();
        //this.statusz /= others.size();
        this.data1 /= others.size();
        this.data2 /= others.size();
    }
}
