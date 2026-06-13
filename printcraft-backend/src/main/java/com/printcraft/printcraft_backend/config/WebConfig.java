package com.printcraft.printcraft_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// Tells Spring: "read this class for config, not business logic"
@Configuration
public class WebConfig implements WebMvcConfigurer {
    //WebMvcConfigurer is Spring's hook interface — you override its methods to customize how HTTP requests are handled.
    // No @Service here because this isn't business logic — it's infrastructure config.
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry resourceHandlerRegistry){
        //    URL pattern — any incoming GET request matching /uploads/anything should be treated as a static resource request
//            (not routed to a controller)
//** = wildcard for any path depth (/uploads/a.jpg, /uploads/2024/june/b.png, etc.)
        // When browser requests /uploads/anything.jpg
        // → look inside the uploads/ folder on disk
        resourceHandlerRegistry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:./uploads/");
    }
}
