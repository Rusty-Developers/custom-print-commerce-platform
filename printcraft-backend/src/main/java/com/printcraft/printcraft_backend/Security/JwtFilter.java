package com.printcraft.printcraft_backend.Security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {
    private final JwtUtil  jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // Step 1: get Authorization header
        String authHeader = request.getHeader("Authorization");
        // Step 2 & 3: check "Bearer " and extract token
        if(authHeader!=null && authHeader.startsWith("Bearer ")){
            String token = authHeader.substring(7); // removes "Bearer " prefix--extract bearer
            // Step 4: validate token
            String phoneNo = null;
            String role = null;
            if(jwtUtil.isTokenValid(token)){
                // Step 5: extract phone and role
             phoneNo = jwtUtil.extractPhone(token);
             role = jwtUtil.extractRole(token);
            }
            // Step 6: Tell Spring Security this user is authenticated
            //NOTE:-> WITHOUT CHECKING PHONENO NULL creating an authenticated user with null identity
            if(phoneNo!=null){
                UsernamePasswordAuthenticationToken authenticationToken
                        = new UsernamePasswordAuthenticationToken(
                        phoneNo,
                        null, // password (we don't need it — token already proved identity)
                        List.of(new SimpleGrantedAuthority("ROLE_" + role))
                );
                SecurityContextHolder.getContext()
                        .setAuthentication(authenticationToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}
