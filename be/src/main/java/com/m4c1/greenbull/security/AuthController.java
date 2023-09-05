package com.m4c1.greenbull.security;

import com.m4c1.greenbull.api_gateway.RestResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.*;

@Slf4j
@Controller
public class AuthController {

    private final String USER_NAME = "username";
    private final String PASSWORD = "password";
    private final String PW2FA = "2fa";

    @Autowired
    private UserSecurityService userSecurityService;

    @PostMapping("/login")
    public ResponseEntity<?>  login(
            final HttpServletRequest request,
            @RequestBody final Optional<String> msg
    ) throws ServletException, IOException {

        final String username = request.getParameter(USER_NAME);
        final String password = request.getParameter(PASSWORD);
        final RestResponse<String> body = userSecurityService.login(username, password, request, null);

        return ResponseEntity.ok()
                .body(body);
    }

    @PostMapping("/login2fa")
    public ResponseEntity<?>  login2fa(
            final HttpServletRequest request,
            @RequestBody final Optional<String> msg
    ) throws ServletException, IOException {

        final String confirmation = request.getParameter(PW2FA);
        final String username = request.getParameter(USER_NAME);
        RestResponse<String> body = userSecurityService.loginConfirmation(username, confirmation, request, null);

        return ResponseEntity.ok()
                .body(body);
    }

    // TODO többi ws: changePassword, updatePassword,  stb...
}
