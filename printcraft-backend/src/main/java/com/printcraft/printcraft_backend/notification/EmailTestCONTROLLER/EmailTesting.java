package com.printcraft.printcraft_backend.notification.EmailTestCONTROLLER;

import com.printcraft.printcraft_backend.notification.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
//to get propar logs so that we can trace immediately
@Slf4j
public class EmailTesting {
    private final EmailService emailService;
    @GetMapping("/test/send-email")
    public String sendTestMail(){
        try{
            emailService.sendEmail("somnathmondal32kol@gmail.com",
                    "Test Email — PrintCraft","<h2>This is a test email from PrintCraft backend.</h2>");
        } catch (Exception e) {
            log.error("Failed to send email to {} : {}", "somnathmondal32kol@gmail.com", e.getMessage(), e);
        }

        return "Email trigger sent — check logs and inbox.";
    }
}
