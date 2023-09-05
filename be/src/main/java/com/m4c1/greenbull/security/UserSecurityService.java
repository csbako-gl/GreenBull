package com.m4c1.greenbull.security;

import com.m4c1.greenbull.api_gateway.RestResponse;
import com.m4c1.greenbull.security.error.InvalidMatchingPasswordException;
import com.m4c1.greenbull.security.error.InvalidOldPasswordException;
import com.m4c1.greenbull.security.error.UserAlreadyExistException;
import com.m4c1.greenbull.security.jwt.JwtUtil;
import com.m4c1.greenbull.security.passwordresettoken.PasswordResetToken;
import com.m4c1.greenbull.security.passwordresettoken.PasswordResetTokenRepository;
import com.m4c1.greenbull.security.privilege.Privilege;
import com.m4c1.greenbull.security.role.Role;
import com.m4c1.greenbull.security.user.User;
import com.m4c1.greenbull.security.user.UserDto;
import com.m4c1.greenbull.security.user.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Calendar;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class UserSecurityService {

    @Autowired
    private PasswordResetTokenRepository passwordTokenRepository;
  
    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationSuccessHandler myAuthenticationSuccessHandler;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private ApplicationEventPublisher eventPublisher;


    public String validatePasswordResetToken(String token) {
        final PasswordResetToken passToken = passwordTokenRepository.findByToken(token);
        return !isTokenFound(passToken)
                ? "invalidToken"
                : (isTokenExpired(passToken) ? "expired" : null);
    }

    private boolean isTokenFound(PasswordResetToken passToken) {
        return passToken != null;
    }

    private boolean isTokenExpired(PasswordResetToken passToken) {
        final Calendar cal = Calendar.getInstance();
        return passToken.getExpiryDate().before(cal.getTime());
    }

    public RestResponse<String> login(
            String username,
            String password,
            final HttpServletRequest request,
            final HttpServletResponse response
    ) throws ServletException, IOException {

        RestResponse<String> body = new RestResponse<>();
        User user = userService.findUserByEmail(username);
        if (user == null) {
            log.info("invalid user: {}", username);
            return RestResponse.<String>builder()
                    .data("")
                    .status(SecurityConstants.STATUS_INVALID_USER_OR_PW)
                    .message(SecurityConstants.MESSAGE_INVALID_USER_OR_PW)
                    .build();
        }

        try {
            body.setStatus(user.isUsing2FA() ? SecurityConstants.STATUS_2FA : SecurityConstants.STATUS_SUCCESS);

            if (user.isUsing2FA()) {
                body.setData(username);
                if (!userService.checkIfValidOldPassword(user, password)) {
                    throw new InvalidOldPasswordException();
                }
            } else {
                Authentication auth = authWithPassword(user, password);
                myAuthenticationSuccessHandler.onAuthenticationSuccess(request, response, auth);
                UserDetails userDetails =  userDetailsService.loadUserByUsername(username);
                body.setToken(jwtUtil.generateToken(userDetails));
            }
        } catch (InvalidOldPasswordException e) {
            log.info("invalid password for user: {}", username);
            return RestResponse.<String>builder()
                    .data("")
                    .status(SecurityConstants.STATUS_INVALID_USER_OR_PW)
                    .message(SecurityConstants.MESSAGE_INVALID_USER_OR_PW)
                    .build();
        }

        return body;
    }

    public RestResponse<String> loginConfirmation(
            String username,
            String confirmationCode2fa,
            final HttpServletRequest request,
            final HttpServletResponse response
    ) throws ServletException, IOException {

        RestResponse<String> body = new RestResponse<>();
        User user = userService.findUserByEmail(username);
        if (user == null) {
            log.info("invalid user: {}", username);
            return RestResponse.<String>builder()
                    .data("")
                    .status(SecurityConstants.STATUS_INVALID_USER_OR_PW)
                    .message(SecurityConstants.MESSAGE_INVALID_USER_OR_PW)
                    .build();
        }

        if (!CustomAuthenticationProvider.checkVerificationCode(user, confirmationCode2fa)) {
            log.info("invalid verification code: {}", username);
            return RestResponse.<String>builder()
                    .data("")
                    .status(SecurityConstants.STATUS_INVALID_VERIFICATION)
                    .message(SecurityConstants.MESSAGE_INVALID_VERIFICATION)
                    .build();
        }

        Authentication auth = generateAuthentication(user);
        myAuthenticationSuccessHandler.onAuthenticationSuccess(request, response, auth);
        UserDetails userDetails =  userDetailsService.loadUserByUsername(username);
        body.setToken(jwtUtil.generateToken(userDetails));
        body.setStatus(SecurityConstants.STATUS_SUCCESS);

        return body;
    }

    public Authentication generateAuthentication(@NotNull User user) {
        List<Privilege> privileges = user.getRoles()
                .stream()
                .map(Role::getPrivileges)
                .flatMap(Collection::stream)
                .distinct()
                .toList();

        List<GrantedAuthority> authorities = privileges.stream()
                .map(p -> new SimpleGrantedAuthority(p.getName()))
                .collect(Collectors.toList());

        Authentication authentication = new UsernamePasswordAuthenticationToken(user, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return authentication;
    }

    public Authentication authWithPassword(User user, String password) {
        if (!userService.checkIfValidOldPassword(user, password)) {
            throw new InvalidOldPasswordException();
        }
        return generateAuthentication(user);
    }

    public RestResponse<String> registerNewUserAccount(final UserDto accountDto, final HttpServletRequest request) {

        try {
            final User registered = userService.registerNewUserAccount(accountDto);
            eventPublisher.publishEvent(new OnRegistrationCompleteEvent(registered, request.getLocale(), getAppUrl(request)));
            return RestResponse.<String>builder()
                    .data("")
                    .status(SecurityConstants.STATUS_SUCCESS)
                    .build();
        } catch (UserAlreadyExistException e) {
            log.info("There is an account with that email address : {}", accountDto.getEmail());
            return RestResponse.<String>builder()
                    .data("")
                    .status(SecurityConstants.STATUS_USERNAME_ALREADY_EXISTS)
                    .message(SecurityConstants.MESSAGE_USERNAME_ALREADY_EXISTS)
                    .build();
        } catch (InvalidMatchingPasswordException e) {
            return RestResponse.<String>builder()
                    .data("")
                    .status(SecurityConstants.STATUS_INVALID_MATCHING_PASSWORD)
                    .message(SecurityConstants.MESSAGE_INVALID_MATCHING_PASSWORD)
                    .build();
        }
    }

    public void authWithoutPassword(User user) {

        List<Privilege> privileges = user.getRoles()
                .stream()
                .map(Role::getPrivileges)
                .flatMap(Collection::stream)
                .distinct()
                .toList();

        List<GrantedAuthority> authorities = privileges.stream()
                .map(p -> new SimpleGrantedAuthority(p.getName()))
                .collect(Collectors.toList());

        Authentication authentication = new UsernamePasswordAuthenticationToken(user, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    public String getAppUrl(HttpServletRequest request) {
        return "http://" + request.getServerName() + ":" + request.getServerPort() + request.getContextPath();
    }
}
