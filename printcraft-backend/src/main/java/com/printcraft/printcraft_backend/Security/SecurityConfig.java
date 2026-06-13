//package com.printcraft.printcraft_backend.Security;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
//
//@Configuration
//@EnableWebSecurity
//public class SecurityConfig {
//    private final JwtFilter jwtFilter;
//
//    public SecurityConfig(JwtFilter jwtFilter) {
//        this.jwtFilter = jwtFilter;
//    }
//    //for password hashing
//    @Bean
//    public PasswordEncoder passwordEncoder(){
//        return new BCryptPasswordEncoder();
//    }
//
//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
////        RBAC rule
//        http
//                .csrf(csrf -> csrf.disable())
//                .authorizeHttpRequests(auth ->
////                        auth.anyRequest().permitAll() // allow all request
//                        //public :->
//                                auth.requestMatchers("/").permitAll()
//                         .requestMatchers("/api/products/**").permitAll() //anyone can view products
//                                .requestMatchers("/api/auth/**").permitAll() //anone can come and see products until auth
//                                //ADMIN :->
//                                .requestMatchers("/api/admin/**").hasRole("ADMIN")
//                                // EVERYTHING ELSE NEEDS LOGIN
//                                .anyRequest().authenticated()
//                )
//                // ADD JWT FILTER HERE
//                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
// /// //// for now -->> ALLOW EVERYONE
//        return http.build();
//    }
//}
//--------------------------
package com.printcraft.printcraft_backend.Security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth ->
                        auth.anyRequest().permitAll()
                );

        return http.build();
    }
}
