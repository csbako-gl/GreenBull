package com.m4c1.greenbull.security.privilege;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PrivilegeDto {
    private Long id;
    private String name;

    public PrivilegeDto(Privilege privilege) {
        this.id = privilege.getId();
        this.name = privilege.getName();
    }
}
