package com.m4c1.greenbull.security.user;


import com.m4c1.greenbull.api_gateway.RestResponse;
import com.m4c1.greenbull.security.error.InvalidOldPasswordException;
import com.m4c1.greenbull.security.passwordresettoken.PasswordDto;
import com.m4c1.greenbull.security.verificationtoken.VerificationToken;
import com.m4c1.greenbull.security.GenericResponse;
import com.m4c1.greenbull.security.UserSecurityService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.*;

import static com.m4c1.greenbull.ApplicationConstants.*;

@Slf4j
@RestController
@RequestMapping({ "/user" })
public class UserSecurityController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserSecurityService userSecurityService;

    @Autowired
    private MessageSource messages;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private Environment env;

    @Autowired
    ActiveUserStore activeUserStore;


    @PostMapping("/registration")
    public RestResponse<String> registration(
            final HttpServletRequest request,
            @RequestBody final Optional<String> msg
    ) {
        log.debug("Registering user account with information: {}", request.getParameter(USER_NAME));
        return userSecurityService.registerNewUserAccount( UserDto.builder()
                .email(request.getParameter(EMAIL))
                .password(request.getParameter(PASSWORD))
                .matchingPassword(request.getParameter(MATCHING_PASSWORD))
                .firstName(request.getParameter(FIRST_NAME))
                .lastName(request.getParameter(LAST_NAME))
                .build(),
                request);
    }

    @GetMapping("/logged")
    public RestResponse<String> logged(
            final HttpServletRequest request,
            @RequestBody final Optional<String> msg
    ) throws ServletException, IOException {
        log.debug("Logged user");
        User user = userSecurityService.getCurrentUser();
        return RestResponse.<String>builder().data(user.getEmail()).build();
    }


    // User activation - verification
    @GetMapping("/resendRegistrationToken")
    public GenericResponse resendRegistrationToken(final HttpServletRequest request, @RequestParam("token") final String existingToken) {
        final VerificationToken newToken = userSecurityService.generateNewVerificationToken(existingToken);
        final User user = userSecurityService.getUser(newToken.getToken());
        mailSender.send(constructResendVerificationTokenEmail(userSecurityService.getAppUrl(request), request.getLocale(), newToken, user));
        return new GenericResponse(messages.getMessage("message.resendToken", null, request.getLocale()));
    }

    // Reset password
    @PostMapping("/resetPassword")
    public GenericResponse resetPassword(final HttpServletRequest request, @RequestParam("email") final String userEmail) {
        final User user = userService.findUserByEmail(userEmail);
        if (user != null) {
            final String token = UUID.randomUUID().toString();
            userSecurityService.createPasswordResetTokenForUser(user, token);
            mailSender.send(constructResetTokenEmail(userSecurityService.getAppUrl(request), request.getLocale(), token, user));
        }
        return new GenericResponse(messages.getMessage("message.resetPasswordEmail", null, request.getLocale()));
    }

    // Save password
    @PostMapping("/savePassword")
    public GenericResponse savePassword(final Locale locale, @Valid PasswordDto passwordDto) {

        final String result = userSecurityService.validatePasswordResetToken(passwordDto.getToken());

        if(result != null) {
            return new GenericResponse(messages.getMessage("auth.message." + result, null, locale));
        }

        Optional<User> user = userSecurityService.getUserByPasswordResetToken(passwordDto.getToken());
        if(user.isPresent()) {
            userSecurityService.changeUserPassword(user.get(), passwordDto.getNewPassword());
            return new GenericResponse(messages.getMessage("message.resetPasswordSuc", null, locale));
        } else {
            return new GenericResponse(messages.getMessage("auth.message.invalid", null, locale));
        }
    }

    // Change user password
    @PostMapping("/updatePassword")
    public GenericResponse changeUserPassword(final Locale locale, @Valid PasswordDto passwordDto) {
        final User user = userService.findUserByEmail(((User) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getEmail());
        if (!userSecurityService.checkIfValidOldPassword(user, passwordDto.getOldPassword())) {
            throw new InvalidOldPasswordException();
        }
        userSecurityService.changeUserPassword(user, passwordDto.getNewPassword());
        return new GenericResponse(messages.getMessage("message.updatePasswordSuc", null, locale));
    }

    // Change user 2 factor authentication
    @PostMapping("/update/2fa")
    public RestResponse<String> modifyUser2FA(@RequestParam("use2FA") final boolean use2FA) throws UnsupportedEncodingException {
        final User user = userSecurityService.updateUser2FA(use2FA);
        if(user== null) {
            return RestResponse.<String>builder().error("There is no active user").build();
        }
        log.debug("user change 2FA to: {}", use2FA ? "enabled" : "disabled");
        return RestResponse.<String>builder()
                .data(use2FA ? userSecurityService.generateQRUrl(user) : "")
                .message("")
                .build();
    }

    // ============== NON-API ============

    private SimpleMailMessage constructResendVerificationTokenEmail(final String contextPath, final Locale locale, final VerificationToken newToken, final User user) {
        final String confirmationUrl = contextPath + "/registrationConfirm.html?token=" + newToken.getToken();
        final String message = messages.getMessage("message.resendToken", null, locale);
        return constructEmail("Resend Registration Token", message + " \r\n" + confirmationUrl, user);
    }

    private SimpleMailMessage constructResetTokenEmail(final String contextPath, final Locale locale, final String token, final User user) {
        final String url = contextPath + "/user/changePassword?token=" + token;
        final String message = messages.getMessage("message.resetPassword", null, locale);
        return constructEmail("Reset Password", message + " \r\n" + url, user);
    }

    private SimpleMailMessage constructEmail(String subject, String body, User user) {
        final SimpleMailMessage email = new SimpleMailMessage();
        email.setSubject(subject);
        email.setText(body);
        email.setTo(user.getEmail());
        email.setFrom(env.getProperty("support.email"));
        return email;
    }

    private String getClientIP(HttpServletRequest request) {
        final String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty() || !xfHeader.contains(request.getRemoteAddr())) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
