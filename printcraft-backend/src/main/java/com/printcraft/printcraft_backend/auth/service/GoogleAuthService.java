package com.printcraft.printcraft_backend.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.printcraft.printcraft_backend.Admin.AdminAuth.AdministratorEntity;
import com.printcraft.printcraft_backend.Admin.AdminAuth.AdministratorRepository;
import com.printcraft.printcraft_backend.Security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

@Service
@RequiredArgsConstructor
// logging
@Slf4j
public class GoogleAuthService {
    @Value("${google.client.id}")
    private String googleClientId;
    private final JwtUtil jwtUtil;
    private final AdministratorRepository administratorRepository;
    // HARDCODED — only this email passes. Ever.
    private static final String ADMIN_EMAIL = "mkgroupprinting@gmail.com";

    // verify-login by google's login method
    public String verifyAdminLogin(String idToken) {
        try {
            // STEP 1+2: Ask Google "is this token real?"
            // NetHttpTransport = how to reach Google's servers
            // GsonFactory = how to parse Google's JSON response
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    new GsonFactory()).setAudience(Collections.singleton(googleClientId))
                    // setAudience = "this token must be FOR our app specifically"
                    // prevents tokens from other apps being used here
                    .build();
            // now verify
            GoogleIdToken googleIdToken = verifier.verify(idToken);
            if (googleIdToken == null) {
                // token was fake, expired, or for a different app
                throw new RuntimeException("Invalid or expired Google token");
            }
            // if token is genuine read what's inside
            GoogleIdToken.Payload payload = googleIdToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            log.info("Google admin login attempt: {}", email);
            // check if it's match with ADMIN_EMAIL ----->> THE ONLY SECURITY GATE THAT
            // MATTERS
            if (!email.equals(ADMIN_EMAIL)) {
                log.warn("REJECTED unauthorized admin attempt from: {}", email);
                throw new RuntimeException("Access denied.");
            }
            // STEP 5: First time login → create admin record in admin_users table
            // After that → just fetch existing record
            AdministratorEntity administrator = administratorRepository.findByEmail(email).orElseGet(
                    () -> {
                        // then, we should make a newAdmin for first time login
                        AdministratorEntity newAdmin = AdministratorEntity.builder()
                                .name(name != null ? name : "MK Group Admin")
                                .email(email)
                                .build();
                        // save into REpo/db
                        return administratorRepository.save(newAdmin);
                    });
            // STEP 6: Google's job is done — now MY system takes over
            // Issue MY own JWT exactly like the OTP flow does
            // return the Token as String
            return jwtUtil.generateToken(administrator.getEmail(),
                    administrator.getRole().name(),
                    administrator.getName());
        } catch (RuntimeException e) {
            throw e;
        } catch (GeneralSecurityException e) {
            log.error("Google verification error: {}", e.getMessage());
            throw new RuntimeException("Google authentication failed");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
