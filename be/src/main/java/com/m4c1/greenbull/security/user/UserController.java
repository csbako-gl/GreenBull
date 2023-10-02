package com.m4c1.greenbull.security.user;

import com.m4c1.greenbull.api_gateway.RestResponse;
import com.m4c1.greenbull.security.UserSecurityService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Locale;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping({ "/logged_user" })
public class UserController {

    @Autowired
    ActiveUserStore activeUserStore;

    @Autowired
    UserSecurityService userSecurityService;

    @PostMapping("/all")
    public RestResponse<List<String>> getLoggedUser(
            final HttpServletRequest request,
            @RequestBody final Optional<String> msg
    ) {
        return RestResponse.<List<String>>builder().data(activeUserStore.getUsers()).build();
    }

    @GetMapping("/loggedUsersFromSessionRegistry")
    public RestResponse<List<String>> getLoggedUsersFromSessionRegistry(final Locale locale, final Model model) {
        return RestResponse.<List<String>>builder().data(userSecurityService.getUsersFromSessionRegistry()).build();
    }
}