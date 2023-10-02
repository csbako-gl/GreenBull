package com.m4c1.greenbull.security.user;

import com.m4c1.greenbull.security.passwordmatches.PasswordMatches;
import com.m4c1.greenbull.security.validation.ValidEmail;
import com.m4c1.greenbull.security.validation.ValidPassword;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

import java.io.Serializable;

@Data
@PasswordMatches
@Builder
public class UserDto {

    @NotNull
    @Size(min = 1, message = "{Size.userDto.firstName}")
    private String firstName;

    @NotNull
    @Size(min = 1, message = "{Size.userDto.lastName}")
    private String lastName;

    /*@ValidPassword*/
    private String password;

    @NotNull
    @Size(min = 1)
    private String matchingPassword;

    /*@ValidEmail*/
    @NotNull
    @Size(min = 1, message = "{Size.userDto.email}")
    private String email;

    private boolean isUsing2FA;

    private Integer role;

    @Override
    public String toString() {
        return "UserDto [firstName=" + firstName +
                ", lastName=" + lastName +
                ", email=" + email +
                ", isUsing2FA=" + isUsing2FA +
                ", role=" + role + "]";
    }
}
