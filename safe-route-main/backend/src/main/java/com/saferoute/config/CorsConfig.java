package com.saferoute.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
               .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }}




// @Bean
// public CorsConfigurationSource corsConfig() {
//     CorsConfiguration cfg = new CorsConfiguration();
//     cfg.setAllowedOriginPatterns(List.of("*"));
//     cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
//     cfg.setAllowedHeaders(List.of("*"));
//     cfg.setExposedHeaders(List.of("Authorization"));
//     cfg.setAllowCredentials(true);
//     cfg.setMaxAge(3600L);
//     UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//     source.registerCorsConfiguration("/**", cfg);
//     return source;
// }