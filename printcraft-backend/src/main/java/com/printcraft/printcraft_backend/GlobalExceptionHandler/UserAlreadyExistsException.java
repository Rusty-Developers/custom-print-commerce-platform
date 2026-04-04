package com.printcraft.printcraft_backend.GlobalExceptionHandler;

public class UserAlreadyExistsException extends  RuntimeException{
    public UserAlreadyExistsException(String message){
        super(message);
    }
}
