package com.saferoute.config;

import com.saferoute.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.*;

@Configuration @RequiredArgsConstructor
public class UserDetailsConfig {
    private final UserRepository userRepository;

    @Bean
    public UserDetailsService userDetailsService() {
        return email -> userRepository.findByEmail(email)
            .map(u -> User.withUsername(u.getEmail())
                .password(u.getPassword())
                .roles(u.getRole().name())
                .build())
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }
}
