package com.m4c1.greenbull.security.passwordresettoken;

import com.m4c1.greenbull.security.validation.ValidPassword;
import lombok.Data;

@Data
public class PasswordDto {

    private String oldPassword;

    private  String token;

    @ValidPassword
    private String newPassword;

}
