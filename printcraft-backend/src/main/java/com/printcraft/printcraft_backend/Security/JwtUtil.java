package com.printcraft.printcraft_backend.Security;

import com.printcraft.printcraft_backend.auth.dto.RegisterRequest;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.security.oauth2.resource.OAuth2ResourceServerProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.PublicKey;
import java.util.Date;
@Component
public class JwtUtil {
    //reads jwt_secreat and jwt_expiry stragey from application.properties
    @Value("${jwt.secret}")
    private  String secret;
    // reads jwt.expiration from application.properties
    @Value("${jwt.expiration}")
    private long expiration;
//SECREATKEY FUNCTION
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

//    generate token with phoneNo + role
    public String generateToken(String phoneno, String role, String name){
        Date now = new Date();
        //use jwt.builder
        String token = Jwts.builder()
                .setSubject(phoneno) //who is this jwt for
                .claim("role", role) //extra data inside token
                .claim("name", name != null ? name : "MK Group Printing Member") //extra data inside token
                .setIssuedAt(now) //when was it created
                .setExpiration(new Date(System.currentTimeMillis()+expiration)) //when it will expire
                .signWith(getSigningKey()).compact(); // adding the secret key
        return token;
    }

    // Called on every request — reads phone from token
    public String extractPhone(String token){

        return getClaims(token).getSubject();
    }
    //return true if token valid, false if expired/wrong
    public boolean isTokenValid(String token) {
        try {
            getClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
// helper — parses the token and returns its contents
    private Claims getClaims(String token){
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token).getBody();
    }

    public String extractRole(String token) {
        return getClaims(token).get("role",String.class);
    }
}
