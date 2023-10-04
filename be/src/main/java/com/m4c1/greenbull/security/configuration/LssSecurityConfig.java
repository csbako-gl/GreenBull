package com.m4c1.greenbull.security.configuration;

import com.m4c1.greenbull.security.CustomAuthenticationProvider;
import com.m4c1.greenbull.security.CustomWebAuthenticationDetailsSource;
import com.m4c1.greenbull.security.jwt.JwtRequestFilter;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.session.SessionRegistryImpl;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.expression.DefaultWebSecurityExpressionHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class LssSecurityConfig {

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private CustomWebAuthenticationDetailsSource authenticationDetailsSource;

    @Autowired
    private AuthenticationSuccessHandler myAuthenticationSuccessHandler;

    @Autowired
    private HttpServletRequest httpServletRequest;

    @Autowired
    private JwtRequestFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors().and()
                .csrf().disable()
                //.exceptionHandling().authenticationEntryPoint(unauthorizedHandler)
                //.and()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers(
                                        "/login*",
                                        "/logout*",
                                        "/registrationConfirm*",
                                        "/forgetPassword*",
                                        "/updatePassword*",
                                        "/qrcode*",
                                        "/battery_data*",   // TODO remove
                                        "/battery_data**",  // TODO remove
                                        "/battery_data/**", // TODO remove
                                        "/settings**",      // TODO remove?
                                        "/settings/*",      // TODO remove?
                                        "/settings*",       // TODO remove?
                                        "/v3/api-docs/**",
                                        "/swagger.json",
                                        "/swagger-ui/index.html**",
                                        "/swagger-ui/**",
                                        "/swagger/**",
                                        "/swg**",
                                        "/swagger-ui.html",
                                        "/swagger-resources/**",
                                        "/swagger**",
                                        "/webjars/**", // swagger
                                        "/user/registration**",
                                        "/user/registration/**",
                                        "/user/resendRegistrationToken*",
                                        "/user/resetPassword*",
                                        "/user/savePassword*",
                                        "/error**",
                                        "/error/**",
                                        "/user/changePassword*")
                        .permitAll()
                        .csrf(csrf -> {
                            csrf.ignoringRequestMatchers(
                                    "/login*",
                                    "/logout*",
                                    "/registrationConfirm*",
                                    "/forgetPassword*",
                                    "/updatePassword*",
                                    "/qrcode*",
                                    "/battery_data*",   // TODO remove
                                    "/battery_data**",  // TODO remove
                                    "/battery_data/**", // TODO remove
                                    "/settings**",      // TODO remove?
                                    "/settings/*",      // TODO remove?
                                    "/settings*",       // TODO remove?
                                    "/v3/api-docs/**",
                                    "/swagger.json",
                                    "/swagger-ui/index.html**",
                                    "/swagger-ui/**",
                                    "/swagger/**",
                                    "/swg**",
                                    "/swagger-ui.html",
                                    "/swagger-resources/**",
                                    "/swagger**",
                                    "/webjars/**", // swagger
                                    "/user/registration**",
                                    "/user/registration/**",
                                    "/user/resendRegistrationToken*",
                                    "/user/resetPassword*",
                                    "/user/savePassword*",
                                    "/error**",
                                    "/error/**",
                                    "/user/changePassword*");
                        })
                        .anyRequest().authenticated()
                );
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public SessionRegistry sessionRegistry() {
        return new SessionRegistryImpl();
    }

    @Bean
    public JavaMailSender javaMailSender() {
        return new JavaMailSenderImpl();
    }

    @Bean
    public DaoAuthenticationProvider authProvider() {
        final CustomAuthenticationProvider authProvider = new CustomAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(encoder());
        return authProvider;
    }

    @Bean
    public PasswordEncoder encoder() {
        return new BCryptPasswordEncoder(11);
    }

    @Bean
    public DefaultWebSecurityExpressionHandler webSecurityExpressionHandler() {
        DefaultWebSecurityExpressionHandler expressionHandler = new DefaultWebSecurityExpressionHandler();
        expressionHandler.setRoleHierarchy(roleHierarchy());
        return expressionHandler;
    }

    @Bean
    public RoleHierarchy roleHierarchy() {
        RoleHierarchyImpl roleHierarchy = new RoleHierarchyImpl();
        String hierarchy = "ROLE_ADMIN > ROLE_STAFF \n ROLE_STAFF > ROLE_USER";
        roleHierarchy.setHierarchy(hierarchy);
        return roleHierarchy;
    }

/*    @Bean
    public RememberMeServices rememberMeServices() {
        CustomRememberMeServices rememberMeServices = new CustomRememberMeServices("theKey", userDetailsService, new InMemoryTokenRepositoryImpl());
        return rememberMeServices;
    }*/

}