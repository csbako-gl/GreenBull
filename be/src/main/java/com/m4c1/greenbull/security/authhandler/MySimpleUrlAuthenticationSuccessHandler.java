package com.m4c1.greenbull.security.authhandler;

import com.m4c1.greenbull.security.user.ActiveUserStore;
import com.m4c1.greenbull.security.user.LoggedUser;
import com.m4c1.greenbull.security.user.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.RedirectStrategy;
import org.springframework.security.web.WebAttributes;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collection;

import static com.m4c1.greenbull.security.privilege.PrivilegeType.*;

@Slf4j
@Component("myAuthenticationSuccessHandler")
public class MySimpleUrlAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    private RedirectStrategy redirectStrategy = new DefaultRedirectStrategy();

    @Autowired
    ActiveUserStore activeUserStore;

//    @Autowired
//    private DeviceService deviceService;

    @Autowired
    private Environment env;

    @Override
    public void onAuthenticationSuccess(final HttpServletRequest request, final HttpServletResponse response, final Authentication authentication) throws IOException {
        log.warn("Authentication Success.");
        handle(request, response, authentication);

        final HttpSession session = request.getSession(false);

        String username;
        if (authentication.getPrincipal() instanceof User user) {
            username = user.getEmail();
        } else if(authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.User user) {
            username = user.getUsername();
        } else {
            username = authentication.getName();
        }
        LoggedUser user = new LoggedUser(username, activeUserStore);
        if (session != null) {
            session.setMaxInactiveInterval(30 * 60);
            session.setAttribute("user", user);
        }
        clearAuthenticationAttributes(request);

        loginNotification(authentication, request);
    }

    private void loginNotification(Authentication authentication, HttpServletRequest request) {
        /*try {
            if (authentication.getPrincipal() instanceof User && isGeoIpLibEnabled()) {
                deviceService.verifyDevice(((User)authentication.getPrincipal()), request);
            }
        } catch (Exception e) {
            logger.error("An error occurred while verifying device or location", e);
            throw new RuntimeException(e);
        }*/
    }

    protected void handle(final HttpServletRequest request, final HttpServletResponse response, final Authentication authentication) throws IOException {
        final String targetUrl = determineTargetUrl(authentication);

        if (response != null && response.isCommitted()) {
            logger.debug("Response has already been committed. Unable to redirect to {}", targetUrl);
        } else {
            //redirectStrategy.sendRedirect(request, response, targetUrl);
        }
    }

    protected String determineTargetUrl(final Authentication authentication) {
        boolean isUser = false;
        boolean isAdmin = false;
        final Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        for (final GrantedAuthority grantedAuthority : authorities) {
            if (grantedAuthority.getAuthority().equals(READ.name())) {
                isUser = true;
            } else if (grantedAuthority.getAuthority().equals(WRITE.name())) {
                isAdmin = true;
                isUser = false;
                break;
            }
        }
        if (isUser) {
            String username;
            if (authentication.getPrincipal() instanceof User user) {
                username = user.getEmail();
            }
            else {
                username = authentication.getName();
            }

            return "/homepage.html?user="+username;
        } else if (isAdmin) {
            return "/console";
        } else {
            throw new IllegalStateException();
        }
    }

    protected void clearAuthenticationAttributes(final HttpServletRequest request) {
        final HttpSession session = request.getSession(false);
        if (session == null) {
            return;
        }
        session.removeAttribute(WebAttributes.AUTHENTICATION_EXCEPTION);
    }

    public void setRedirectStrategy(final RedirectStrategy redirectStrategy) {
        this.redirectStrategy = redirectStrategy;
    }

    protected RedirectStrategy getRedirectStrategy() {
        return redirectStrategy;
    }

    private boolean isGeoIpLibEnabled() {
        return Boolean.parseBoolean(env.getProperty("geo.ip.lib.enabled"));
    }
}