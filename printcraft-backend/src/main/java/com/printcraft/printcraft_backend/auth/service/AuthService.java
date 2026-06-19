package com.printcraft.printcraft_backend.auth.service;

import com.printcraft.printcraft_backend.GlobalExceptionHandler.UserAlreadyExistsException;
import com.printcraft.printcraft_backend.Security.JwtUtil;
import com.printcraft.printcraft_backend.auth.dto.OtpRequest;
import com.printcraft.printcraft_backend.auth.dto.RegisterRequest;
import com.printcraft.printcraft_backend.auth.dto.RegisterResponse;
import com.printcraft.printcraft_backend.auth.dto.VerifyOtpRequest;
import com.printcraft.printcraft_backend.user.domain.Role;
import com.printcraft.printcraft_backend.user.domain.User;
import com.printcraft.printcraft_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    //importing SMS_API_KEY(FAST2SMS)
    @Value("${fast2sms.api.key}")
    private String fast2smsApiKey;
    private final RedisTemplate<String, String> redisTemplate;
//    private final PasswordEncoder passwordEncoder;
//    Transactions:->  @Transactional ensures save() rollback if something fails after the duplicate checks.
    @Transactional
    public RegisterResponse register(RegisterRequest request){
        //logging
        log.info("Registration attempt for phone: {}", request.getPhoneno());
//        if(userRepository.existsByphoneNo(request.getPhoneno())){
//            throw new UserAlreadyExistsException("Phone number already registered");
//        }
        if(request.getEmail() != null && userRepository.existsByEmail(request.getEmail())){
            throw new RuntimeException("Email already in use");
        }
//        //password now taking temporrary to check ->
//        String defultPassword = "temporary123"; // ❌ IT SHOULD - get from request
        //now we can make & save user
        //FIRST CHECK IF THERE HAS ANY USER LOGGEDIN OR NOT
        Optional<User> existingUser = userRepository.findByphoneNo(request.getPhoneno());
        User user;
        if(existingUser.isPresent()){
            // user already exists → just return success (login case)
            user=existingUser.get();
            log.info("User already exists: {}", user.getId());

            return RegisterResponse.builder()
                    .phoneNo(user.getPhoneNo())
                    .email(user.getEmail())
                    .message("User already exists, proceed to OTP verification")
                    .timestamp(LocalDateTime.now())
                    .build();
        }
        user = User.builder()
                .name(request.getName())
                .phoneNo(request.getPhoneno())
                .email(request.getEmail())
                .role(Role.USER)  //hardcoded to avoid anyone's trapping !!! 
                .build();
       User savedUser =  userRepository.save(user);
       //logging
        log.info("New User registered successfully: {}", savedUser.getId());
        return RegisterResponse.builder()
                .phoneNo(savedUser.getPhoneNo())
                .email(savedUser.getEmail())
                .message("User registered successfully, proceed to OTP verification")
                .timestamp(LocalDateTime.now())
                .build();
    }
//SO NOW SYSTEM BEHAVES LIKE-> Case	               Behavior
//                             New user   -->>	   Create user
//                             Existing user --->>   Treat as login
//                             Both  --->>	       Go to OTP

    //OTP Functions:->
    public String sendOTP(OtpRequest otpRequest){
        //first check the phone no. existence
        if(!userRepository.existsByphoneNo(otpRequest.getPhoneno())){
            throw new RuntimeException("OTP sent if user exists");
        }
        //generate otp
      String otp = String.format("%06d",new SecureRandom().nextInt(999999));
      //store in redis for 5 mins AND 100 requests → system crash --->>RATE LIMIT APPLYING
        String key = "OTP:" + otpRequest.getPhoneno();
        redisTemplate.opsForValue().set(key,otp,5, TimeUnit.MINUTES);
        //APPLYING RATE-LIMIT :->
        String attemptsKey = "OTP_ATTEMPTS:" + otpRequest.getPhoneno();
        String attemtsStrTotal = redisTemplate.opsForValue().get(attemptsKey);
        int attempts = (attemtsStrTotal==null)?0: Integer.parseInt(attemtsStrTotal);
        if(attempts>=8){
            throw new RuntimeException("Too many OTP requests. Try later.");
        }
        //increase redis_counter
        redisTemplate.opsForValue().increment(attemptsKey);
        redisTemplate.expire(attemptsKey,10,TimeUnit.MINUTES);

//        //logging in console
//        log.info("OTP for {} is {}", otpRequest.getPhoneno(), otp);
        sendSmsViaFast2SMS(otpRequest.getPhoneno(), otp);
        // Add this right after generating the secure OTP string
        log.info("🔥 [DEMO ACTIVE] Generated OTP for Phone {} is: {}", otpRequest.getPhoneno(), otp);

        return "OTP sent successfully";
    }
    private void sendSmsViaFast2SMS(String phoneNo, String otp) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("authorization", fast2smsApiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Change route from "otp" to "q", add otp to message:
            String body = """
{
  "route": "q",
  "message": "Your PrintCraft OTP is %s",
  "language": "english",
  "flash": 0,
  "numbers": "%s"
}
""".formatted(otp, phoneNo);

            HttpEntity<String> entity = new HttpEntity<>(body, headers);

            var response = restTemplate.postForEntity(
                    "https://www.fast2sms.com/dev/bulkV2",
                    entity,
                    String.class
            );

            log.info("Fast2SMS response: {}", response.getBody());

        } catch (Exception e) {
            log.error("SMS failed: {}", e.getMessage());
        }
    }


    //verifying OTP Function :->
    public String verifyOTP(VerifyOtpRequest request) {

        String key = "OTP:" + request.getPhoneno();
        String storedOtp = redisTemplate.opsForValue().get(key);

        if (storedOtp == null) {
            throw new RuntimeException("OTP expired or not found");
        }

        String verifyKey = "OTP_VERIFY_ATTEMPTS:" + request.getPhoneno();
        String attemptsStr = redisTemplate.opsForValue().get(verifyKey);
        int attempts = (attemptsStr == null) ? 0 : Integer.parseInt(attemptsStr);

        if (attempts >= 5) {
            throw new RuntimeException("Too many wrong attempts");
        }

        if (!storedOtp.equals(request.getOtp())) {
            redisTemplate.opsForValue().increment(verifyKey);
            redisTemplate.expire(verifyKey, 5, TimeUnit.MINUTES);
            throw new RuntimeException("Invalid OTP");
        }

        // ✅ OTP correct → delete
        redisTemplate.delete(key);
        redisTemplate.delete(verifyKey);

        // ✅ get user
        User user = userRepository.findByphoneNo(request.getPhoneno())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ✅ generate JWT
        return jwtUtil.generateToken(
                user.getPhoneNo(),
                user.getRole().name(),
                user.getName()
        );
    }
}
