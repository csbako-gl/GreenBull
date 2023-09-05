package com.m4c1.greenbull.settings;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;

@Data
@Entity
@Builder
@Table(name = "settings")
public class Settings {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(unique = true)
    private Long userId;
    private Integer scale;
    private MenuType menuType;
    private InputStyle inputStyle;
    private Boolean rippleEffect;
    private String theme;
    private ColorScheme colorScheme;
}
