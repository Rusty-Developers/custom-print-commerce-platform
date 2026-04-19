package com.printcraft.printcraft_backend.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    //usuing java-mail sender
    private final JavaMailSender javaMailSender;
    //send email function
    public void sendEmail(String to,String subject,String body){
        try{
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(to);
            mailMessage.setSubject(subject);
            mailMessage.setText(body);
            //send the email.
            javaMailSender.send(mailMessage);
            //logging
            log.info("Email sent to {}", to);
        } catch (Exception e) {
//            throw new RuntimeException(e); ->> app will crash
              log.info("Failed to send email to {}: {}", to,e.getMessage());
        }
    }
}
