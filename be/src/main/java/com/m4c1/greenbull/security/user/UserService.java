package com.m4c1.greenbull.security.user;

import com.m4c1.greenbull.security.role.RoleRepository;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;


    public User save(final User user) {
        return userRepository.save(user);
    }

    public void deleteUser(final User user) {
        userRepository.delete(user);
    }

    public User findUserByEmail(final String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public List<User> findAllUser() {
        return userRepository.findAll();
    }

    public Optional<User> getUserByID(final long id) {
        return userRepository.findById(id);
    }

    public boolean emailExists(final String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    public void delete(User user) {
        userRepository.delete(user);
    }
}
