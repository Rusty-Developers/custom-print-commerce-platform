package com.printcraft.printcraft_backend.Admin.AdminAuth;

import com.printcraft.printcraft_backend.auth.service.GoogleAuthService;
import lombok.RequiredArgsConstructor;
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
    //injecting service class GoogleAuth
    private final GoogleAuthService googleAuthService;
    //O-Auth Login
    @PostMapping("/google")
    public ResponseEntity<?> adminGoogleOauthLogin(@RequestBody Map<String,String> body){
        String idToken = body.get("idToken");
        //input check
        if(idToken==null||idToken.isBlank()){
            return ResponseEntity.badRequest().body(Map.of("error", "idToken is required"));
        }
        //AS a token i will get the output
        String adminJwt = googleAuthService.verifyAdminLogin(idToken);
        return ResponseEntity.ok(
                Map.of("success",true,
                        "Token",adminJwt,
                        "Role","ADMIN"
                )
        );
    }
}
