package com.m4c1.greenbull.security;


import com.m4c1.greenbull.device.Device;
import com.m4c1.greenbull.device.DeviceRepository;
import com.m4c1.greenbull.device.DeviceType;
import com.m4c1.greenbull.device.DeviceTypeRepository;
import com.m4c1.greenbull.security.privilege.Privilege;
import com.m4c1.greenbull.security.privilege.PrivilegeRepository;
import com.m4c1.greenbull.security.role.Role;
import com.m4c1.greenbull.security.user.User;
import com.m4c1.greenbull.security.user.UserRepository;
import com.m4c1.greenbull.security.role.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Component
public class SetupDataLoader implements ApplicationListener<ContextRefreshedEvent> {

    private boolean alreadySetup = false;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PrivilegeRepository privilegeRepository;

    @Autowired
    private DeviceTypeRepository deviceTypeRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // API

    @Override
    @Transactional
    public void onApplicationEvent(final ContextRefreshedEvent event) {
        if (alreadySetup) {
            return;
        }

        // == create initial privileges
        final Privilege readPrivilege = createPrivilegeIfNotFound("READ_PRIVILEGE");
        final Privilege writePrivilege = createPrivilegeIfNotFound("WRITE_PRIVILEGE");
        final Privilege passwordPrivilege = createPrivilegeIfNotFound("CHANGE_PASSWORD_PRIVILEGE");

        // == create initial roles
        final List<Privilege> adminPrivileges = new ArrayList<>(Arrays.asList(readPrivilege, writePrivilege, passwordPrivilege));
        final List<Privilege> userPrivileges = new ArrayList<>(Arrays.asList(readPrivilege, passwordPrivilege));
        final Role adminRole = createRoleIfNotFound("ROLE_ADMIN", adminPrivileges);
        final Role userRole = createRoleIfNotFound("ROLE_USER", userPrivileges);

        // == create initial user
        User admin = createUserIfNotFound("admin@admin.com", "Admin", "Admin", "admin", new ArrayList<>(Collections.singletonList(adminRole)));
        createUserIfNotFound("test@test.com", "Test", "Test", "test", new ArrayList<>(Collections.singletonList(userRole)));

        // == create initial device
        final String desc = "1-port RS485/232 to WiFi converters USR-W610 can realize the bi-directional transparent "
                + "data transmission between RS232/RS485, WiFi and Ethernet. Through simple configuration via Web Server"
                + " or setup software can assign working details, realize serial data and TCP/IP data package transparent"
                + " transmission by converter";
        final DeviceType deviceType = createDeviceTypeIfNotFound("USR-W610", "PUSR", desc, new HashMap<>());
        final Device device = createDeviceIfNotFound("Tibi2", deviceType.getId(), admin.getId(), "TEST000001");
        final Device device2 = createDeviceIfNotFound("Tibi3", deviceType.getId(), admin.getId(), "TEST000002");

        alreadySetup = true;
    }

    private Privilege createPrivilegeIfNotFound(final String name) {
        Privilege privilege = privilegeRepository.findByName(name);
        if (privilege == null) {
            privilege = new Privilege(name);
            privilege = privilegeRepository.save(privilege);
        }
        return privilege;
    }

    private Role createRoleIfNotFound(final String name, final Collection<Privilege> privileges) {
        Role role = roleRepository.findByName(name);
        if (role == null) {
            role = new Role(name);
        }
        role.setPrivileges(privileges);
        role = roleRepository.save(role);
        return role;
    }

    private User createUserIfNotFound(final String email, final String firstName, final String lastName, final String password, final Collection<Role> roles) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = new User();
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setPassword(passwordEncoder.encode(password));
            user.setEmail(email);
            user.setEnabled(true);
        }
        user.setRoles(roles);
        user = userRepository.save(user);
        return user;
    }

    private DeviceType createDeviceTypeIfNotFound(final String name, final String manufacture, final String desc, Map<String, String> otherData) {
        DeviceType deviceType = deviceTypeRepository.findByNameAndManufacture(name, manufacture).orElse(null);
        if(deviceType == null) {
            deviceType = new DeviceType();
            deviceType.setName(name);
            deviceType.setManufacture(manufacture);
            deviceType.setDescription(desc);
            deviceType.setOtherData(otherData);

            deviceType = deviceTypeRepository.save(deviceType);
        }
        return deviceType;
    }

    private Device createDeviceIfNotFound(String name, Long deviceTypeId, Long userId, String bmsId) {
        Device device = deviceRepository.findByUserIdAndName(userId, name).orElse(null);
        if (device == null) {
            device = new Device();
            device.setTypeId(deviceTypeId);
            device.setName(name);
            device.setUserId(userId);
            device.setBmsId(bmsId);

            device = deviceRepository.save(device);
        }
        return device;
    }
}