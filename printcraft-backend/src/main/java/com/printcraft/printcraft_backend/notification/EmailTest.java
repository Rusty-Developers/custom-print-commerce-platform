package com.printcraft.printcraft_backend.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailTest {
    //injecting emailservice
    private final EmailService emailService;
    private final JavaMailSender mailSender;
    //test-send mail
    public void sendTestMail(){
        SimpleMailMessage simpleMailMessage = new SimpleMailMessage();
        simpleMailMessage.setFrom("mkgroupprinting@gmail.com");
        simpleMailMessage.setTo("somnathmondal32kol@gmail.com");
        simpleMailMessage.setSubject("Test Email");
        simpleMailMessage.setText("This is a test from Spring Boot.");
        mailSender.send(simpleMailMessage);
    }

}
