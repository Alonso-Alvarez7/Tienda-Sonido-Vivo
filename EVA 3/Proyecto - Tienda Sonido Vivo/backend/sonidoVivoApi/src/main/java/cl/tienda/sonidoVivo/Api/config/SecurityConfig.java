package cl.tienda.sonidoVivo.Api.config;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import cl.tienda.sonidoVivo.Api.usuario.security.JwtAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {

        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(sesion ->
                        sesion.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(manejo -> manejo
                        .authenticationEntryPoint((request, response, exception) -> {
                            Authentication autenticacion =
                                    SecurityContextHolder.getContext().getAuthentication();
                            log.warn("401 en {} {}: excepción={}, autenticación={}",
                                    request.getMethod(), request.getRequestURI(),
                                    exception.getClass().getSimpleName(),
                                    autenticacion == null ? "ninguna" : autenticacion.getName());
                            response.sendError(HttpStatus.UNAUTHORIZED.value());
                        })
                        .accessDeniedHandler((request, response, exception) -> {
                            Authentication autenticacion =
                                    SecurityContextHolder.getContext().getAuthentication();
                            log.warn("403 en {} {}: usuario={}, permisos={}",
                                    request.getMethod(), request.getRequestURI(),
                                    autenticacion == null ? "ninguno" : autenticacion.getName(),
                                    autenticacion == null ? List.of() : autenticacion.getAuthorities());
                            // sendError dispara un despacho a /error; al ser una ruta protegida,
                            // ese segundo despacho reemplaza el 403 por un 401. setStatus evita eso.
                            response.setStatus(HttpStatus.FORBIDDEN.value());
                        }))
                .authorizeHttpRequests(rutas -> rutas
                        .requestMatchers(
                                "/api/auth/registro",
                                "/api/auth/login",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html").permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/productos/**",
                                "/api/categorias/**").permitAll()

                        .requestMatchers("/api/productos/**")
                                .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/pedidos")
                                .hasAnyRole("ADMIN", "VENDEDOR")

                        .requestMatchers(HttpMethod.PATCH, "/api/pedidos/*/estado")
                                .hasAnyRole("ADMIN", "VENDEDOR")

                        .requestMatchers("/api/usuarios/**")
                                .hasRole("ADMIN")

                        .anyRequest().authenticated())
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuracion) throws Exception {
        return configuracion.getAuthenticationManager();
    }

    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter> jwtAuthenticationFilterRegistration(
            JwtAuthenticationFilter jwtAuthenticationFilter) {
        FilterRegistrationBean<JwtAuthenticationFilter> registration =
                new FilterRegistrationBean<>(jwtAuthenticationFilter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173"));
        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource fuente =
                new UrlBasedCorsConfigurationSource();
        fuente.registerCorsConfiguration("/api/**", config);
        return fuente;
    }
}
