package com.printcraft.printcraft_backend.notification;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    //usuing java-mail sender
    private final JavaMailSender javaMailSender;
    //send email function
    @Async
    public void sendEmail(String to,String subject,String body){
        try{
        //createMimeMessage
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper messageHelper = new MimeMessageHelper(message,true);
            messageHelper.setTo(to);
            messageHelper.setSubject(subject);
            // helper.setText(body, true) -> true means HTML content
            messageHelper.setText(body,true);
            javaMailSender.send(message);
            //logging for success check
            //  log success
            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            // app should not crash
//            throw new RuntimeException(e); ->> app will crash
            log.error("Failed to send email to {} : {}", to, e.getMessage(), e);
        }
    }
}
