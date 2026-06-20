package com.printcraft.printcraft_backend.DeliveryTracking.ShipRocket;

import com.printcraft.printcraft_backend.DeliveryTracking.ShipRocket.DTO.ShiprocketAuthRequest;
import com.printcraft.printcraft_backend.DeliveryTracking.ShipRocket.DTO.ShiprocketAuthResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;

@Service
//LOGGING
@Slf4j
public class ShiprocketAuthService {

    //Caching is storing the result of an expensive operation — like a network call or DB query
    // — in a faster, temporary location so future requests can reuse it instead of repeating the operation.
    //here, we use simple variable---HERE CACHING->"Save the result of an expensive operation so you don't repeat it unnecessarily"
    @Value("${shiprocket.email}")
    private String email;
    @Value("${shiprocket.password}")
    private String password;
    @Value("${shiprocket.base-url}")
    private String baseUrl;
    private final RestTemplate restTemplate;
//       // Token cached in memory → singleton bean = shared across all calls
    private String cachedToken; // our caching mechanics
    private LocalDateTime expiryTokenTime;
    public ShiprocketAuthService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    // Every Shiprocket API call uses this method --this method will checked by service classes
    public String getValidToken(){
        if (isTokenValid()) {
            log.info("Using cached Shiprocket token");
            return cachedToken;
        }
        log.info("Token expired or missing. Refreshing...");
        return refreshToken();  //new token needs when toke n null or first time or expired
    }
//    Is my stored token still valid?
//    YES → return it (no login needed)
//    NO  → call Shiprocket login API, get fresh token, return it
    private String refreshToken() {
        try {
            // Step 1 — build the URL
            String loginUrl = baseUrl + "/auth/login";
            //the way we called it in potstman same so need headebody,method
            // Step 2 — build the request body { email, password }
            ShiprocketAuthRequest requestBody = new ShiprocketAuthRequest(email,password);
            //now set  header "Content-Type: application/json"
            HttpHeaders httpHeaders = new HttpHeaders();
            httpHeaders.setContentType(MediaType.APPLICATION_JSON);
            // Step 4 — combine body + headers into one request object
            HttpEntity<ShiprocketAuthRequest> requestHttpEntity = new HttpEntity<>(requestBody,httpHeaders);
            // Step 5 — actually HIT the Shiprocket API -- we need POST
            ResponseEntity<ShiprocketAuthResponse> response = restTemplate.exchange(
                    loginUrl,
                    HttpMethod.POST,
                    requestHttpEntity,  //body+headers combo
                    ShiprocketAuthResponse.class  // parse response into this class
            );
            //response is a ResponseEntity — it's a wrapper
            ShiprocketAuthResponse body = response.getBody();
            //null-safety check
            if (body == null || body.getToken() == null) {
                throw new RuntimeException("Shiprocket auth failed: empty response");
            }
            this.cachedToken=body.getToken();
            // Step 7 — set expiry = now + 24 hours
            this.expiryTokenTime = LocalDateTime.now().plusHours(24);

            // Step 8 — return the fresh token
            return this.cachedToken;
        }catch (Exception e) {
            log.error("Shiprocket login failed: {}", e.getMessage());
            throw new RuntimeException("Cannot authenticate with Shiprocket: " + e.getMessage());
        }

    }

    private boolean isTokenValid() {
        return (cachedToken!=null && expiryTokenTime!=null&&LocalDateTime.now().isBefore(expiryTokenTime.minusHours(1)));
    }
}
