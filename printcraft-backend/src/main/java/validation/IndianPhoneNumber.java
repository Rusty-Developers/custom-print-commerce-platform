package validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.FIELD)  //it ensures only works on fields"
@Retention(RetentionPolicy.RUNTIME) //works at runtime
@Constraint(validatedBy = IndianPhoneNumberValidator.class) //validator class handles actual logic
public @interface IndianPhoneNumber {
//I am creating a new annotation
//error message when validation fails,
String message() default "Invalid Indian phone number";
//          for validation groups,
    Class<?>[] groups() default {};
//    required by Spring,metadata, required by Spring
    Class<? extends Payload>[] payload() default {};
}
