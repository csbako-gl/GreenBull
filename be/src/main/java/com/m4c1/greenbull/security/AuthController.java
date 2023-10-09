package com.m4c1.greenbull.security;

import com.m4c1.greenbull.api_gateway.RestResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.*;

import static com.m4c1.greenbull.ApplicationConstants.*;

@Slf4j
@Controller
public class AuthController {

    @Autowired
    private UserSecurityService userSecurityService;

    @PostMapping("/login")
    public ResponseEntity<RestResponse<String>>  login(
            final HttpServletRequest request,
            @RequestBody final Optional<String> msg
    ) throws ServletException, IOException {

        final String username = request.getParameter(USER_NAME);
        final String password = request.getParameter(PASSWORD);
        final RestResponse<String> body = userSecurityService.login(username, password, request, null);
        return new ResponseEntity<>(body, Objects.requireNonNullElse(HttpStatus.resolve(body.getStatus()), HttpStatus.INTERNAL_SERVER_ERROR));
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
