package com.m4c1.greenbull.settings;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SettingsRepository extends JpaRepository<Settings, Long> {

    public Optional<Settings> findByUserId(Long userId);

    //@Query("update settings s set s.scale = :scale WHERE s.id = :userId")
    //void update(@Param("userId") Long id, @Param("scale") Integer scale);
}
