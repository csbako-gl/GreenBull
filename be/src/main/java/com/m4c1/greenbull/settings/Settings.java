package com.m4c1.greenbull.settings;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Builder
@Table(name = "settings")
@NoArgsConstructor
@AllArgsConstructor
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
