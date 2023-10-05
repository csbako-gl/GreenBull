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
import com.m4c1.greenbull.security.role.RoleRepository;
import com.m4c1.greenbull.security.user.User;
import com.m4c1.greenbull.security.user.UserDto;
import com.m4c1.greenbull.security.user.UserService;
import com.m4c1.greenbull.security.verificationtoken.VerificationToken;
import com.m4c1.greenbull.security.verificationtoken.VerificationTokenRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotNull;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Calendar;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

import static com.m4c1.greenbull.ApplicationConstants.*;

@Slf4j
@Service
@Transactional
public class UserSecurityService {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordResetTokenRepository passwordTokenRepository;

    @Autowired
    private VerificationTokenRepository tokenRepository;

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

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SessionRegistry sessionRegistry;

    @Autowired
    private Environment env;


    public VerificationToken getVerificationToken(final String VerificationToken) {
        return tokenRepository.findByToken(VerificationToken);
    }

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
                if (!checkIfValidOldPassword(user, password)) {
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
        if (!checkIfValidOldPassword(user, password)) {
            throw new InvalidOldPasswordException();
        }
        return generateAuthentication(user);
    }

    public RestResponse<String> registerNewUserAccount(final UserDto accountDto, final HttpServletRequest request) {

        try {
            final User registered = registerNewUserAccount(accountDto);
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

    public void deleteUser(final User user) {
        final VerificationToken verificationToken = tokenRepository.findByUser(user);

        if (verificationToken != null) {
            tokenRepository.delete(verificationToken);
        }

        final PasswordResetToken passwordToken = passwordTokenRepository.findByUser(user);

        if (passwordToken != null) {
            passwordTokenRepository.delete(passwordToken);
        }

        userService.delete(user);
    }

    public void createVerificationTokenForUser(final User user, final String token) {
        final VerificationToken myToken = new VerificationToken(token, user);
        tokenRepository.save(myToken);
    }

    public VerificationToken generateNewVerificationToken(final String existingVerificationToken) {
        VerificationToken vToken = tokenRepository.findByToken(existingVerificationToken);
        vToken.updateToken(UUID.randomUUID()
                .toString());
        vToken = tokenRepository.save(vToken);
        return vToken;
    }

    public Optional<User> getUserByPasswordResetToken(final String token) {
        return Optional.ofNullable(passwordTokenRepository.findByToken(token).getUser());
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

    public User registerNewUserAccount(final UserDto accountDto) {
        if (userService.emailExists(accountDto.getEmail())) {
            throw new UserAlreadyExistException("There is an account with that email address: " + accountDto.getEmail());
        }

        if (!accountDto.getPassword().equals(accountDto.getMatchingPassword())) {
            throw new InvalidMatchingPasswordException("The password and the matching password not the same");
        }

        final User user = new User();

        user.setFirstName(accountDto.getFirstName());
        user.setLastName(accountDto.getLastName());
        user.setPassword(passwordEncoder.encode(accountDto.getPassword()));
        user.setEmail(accountDto.getEmail());
        user.setUsing2FA(accountDto.isUsing2FA());
        user.setRoles(Collections.singletonList(roleRepository.findByName("ROLE_USER")));
        return userService.save(user);
    }

    public User getUser(final String verificationToken) {
        final VerificationToken token = tokenRepository.findByToken(verificationToken);
        if (token != null) {
            return token.getUser();
        }
        return null;
    }

    public void createPasswordResetTokenForUser(final User user, final String token) {
        final PasswordResetToken myToken = new PasswordResetToken(token, user);
        passwordTokenRepository.save(myToken);
    }

    public PasswordResetToken getPasswordResetToken(final String token) {
        return passwordTokenRepository.findByToken(token);
    }

    public void changeUserPassword(final User user, final String password) {
        user.setPassword(passwordEncoder.encode(password));
        userService.save(user);
    }

    public boolean checkIfValidOldPassword(final User user, final String oldPassword) {
        return passwordEncoder.matches(oldPassword, user.getPassword());
    }

    public String validateVerificationToken(String token) {
        final VerificationToken verificationToken = tokenRepository.findByToken(token);
        if (verificationToken == null) {
            return TOKEN_INVALID;
        }

        final User user = verificationToken.getUser();
        final Calendar cal = Calendar.getInstance();
        if ((verificationToken.getExpiryDate()
                .getTime() - cal.getTime()
                .getTime()) <= 0) {
            tokenRepository.delete(verificationToken);
            return TOKEN_EXPIRED;
        }

        user.setEnabled(true);
        // tokenRepository.delete(verificationToken);
        userService.save(user);
        return TOKEN_VALID;
    }

    public String generateQRUrl(User user) throws UnsupportedEncodingException {
        return QR_PREFIX + URLEncoder.encode(String.format("otpauth://totp/%s:%s?secret=%s&issuer=%s", APP_NAME, user.getEmail(), user.getSecret(), APP_NAME), "UTF-8");
    }

    public User updateUser2FA(boolean use2FA) {
        final Authentication curAuth = SecurityContextHolder.getContext().getAuthentication();
        if (curAuth.getPrincipal() == null) {
            return null;
        }
        UserDetails currentUser = (UserDetails) curAuth.getPrincipal();
        User user = userService.findUserByEmail(currentUser.getUsername());
        user.setUsing2FA(use2FA);
        userService.save(user);
        final Authentication auth = new UsernamePasswordAuthenticationToken(user, user.getPassword(), currentUser.getAuthorities());
        SecurityContextHolder.getContext()
                .setAuthentication(auth);
        return user;
    }

    public List<String> getUsersFromSessionRegistry() {
        return sessionRegistry.getAllPrincipals()
                .stream()
                .filter((u) -> !sessionRegistry.getAllSessions(u, false)
                        .isEmpty())
                .map(o -> {
                    if (o instanceof User) {
                        return ((User) o).getEmail();
                    } else {
                        return o.toString();
                    }
                }).collect(Collectors.toList());
    }

    public Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    public User getCurrentUser() {
        Authentication curAuth = getAuthentication();
        if (curAuth == null || curAuth.getPrincipal() == null) {
            return null;
        }

        String username;
        if (curAuth.getPrincipal() instanceof User user) {
            return user;
        } else if(curAuth.getPrincipal() instanceof org.springframework.security.core.userdetails.User user) {
            // TODO;
            log.error("ERROR: user is missing!!!");
        } else {
            // TODO
            log.error("ERROR: user is missing!!!");
        }
        return null;
    }

    public String getCurrentUsername() {
        Authentication curAuth = getAuthentication();
        if (curAuth == null || curAuth.getPrincipal() == null) {
            return null;
        }

        String username;
        if (curAuth.getPrincipal() instanceof User user) {
            username = user.getEmail();
        } else if(curAuth.getPrincipal() instanceof org.springframework.security.core.userdetails.User user) {
            username = user.getUsername();
        } else {
            username = curAuth.getName();
        }

        return username;
    }

    public String getVersion() {
        return System.getenv().get("GREENBULL_VERSION");
    }
}
