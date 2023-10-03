package com.m4c1.greenbull.security.user;

import com.m4c1.greenbull.security.privilege.Privilege;
import com.m4c1.greenbull.security.privilege.PrivilegeDto;
import com.m4c1.greenbull.security.role.Role;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoggedUserDto {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private Set<PrivilegeDto> privileges;

    public LoggedUserDto(User user) {
        id = user.getId();
        firstName = user.getFirstName();
        lastName = user.getLastName();
        email = user.getEmail();
        privileges = new HashSet<>();
        user.getRoles().forEach(role -> {
            role.getPrivileges().forEach(privilege -> this.privileges.add(new PrivilegeDto(privilege)));
        });
    }
}
