package com.printcraft.printcraft_backend.Admin.AdminAuth;

import com.printcraft.printcraft_backend.Security.JwtUtil;
import com.printcraft.printcraft_backend.auth.service.GoogleAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/admin")
@RequiredArgsConstructor
public class AdminAuthController {

    private final GoogleAuthService googleAuthService;
    private final JwtUtil jwtUtil;
    private final AdministratorRepository administratorRepository;

    // Secret passphrase stored ONLY on the server — never sent to the browser
    @Value("${admin.passphrase}")
    private String adminPassphrase;

    // ── Google OAuth (kept, but frontend no longer uses it) ───────────────
    @PostMapping("/google")
    public ResponseEntity<?> adminGoogleOauthLogin(@RequestBody Map<String, String> body) {
        String idToken = body.get("idToken");
        if (idToken == null || idToken.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "idToken is required"));
        }
        String adminJwt = googleAuthService.verifyAdminLogin(idToken);
        return ResponseEntity.ok(Map.of("success", true, "Token", adminJwt, "Role", "ADMIN"));
    }

    // ── Passphrase login — zero Google dependency ─────────────────────────
    @PostMapping("/passphrase")
    public ResponseEntity<?> adminPassphraseLogin(@RequestBody Map<String, String> body) {
        String submitted = body.getOrDefault("passphrase", "");

        // Constant-time string comparison prevents timing-based attacks
        boolean match = org.springframework.security.crypto.codec.Hex
                .encode(submitted.getBytes()).equals(
                org.springframework.security.crypto.codec.Hex
                        .encode(adminPassphrase.getBytes()));

        if (!match) {
            // Fixed delay blunts brute-force timing probes
            try { Thread.sleep(500); } catch (InterruptedException ignored) {}
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized"));
        }

        // Fetch the first active admin record
        AdministratorEntity admin = administratorRepository.findAll()
                .stream()
                .filter(AdministratorEntity::isActive)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No admin configured"));

        String jwt = jwtUtil.generateToken(
                admin.getEmail(),
                admin.getRole().name(),
                admin.getName()
        );
        return ResponseEntity.ok(Map.of("success", true, "Token", jwt, "Role", "ADMIN"));
    }
}
