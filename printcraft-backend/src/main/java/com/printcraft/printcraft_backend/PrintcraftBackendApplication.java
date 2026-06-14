package com.printcraft.printcraft_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
//Adding this annotation here to turn on the background thread engine!
@EnableAsync
public class PrintcraftBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(PrintcraftBackendApplication.class, args);
	}

}
