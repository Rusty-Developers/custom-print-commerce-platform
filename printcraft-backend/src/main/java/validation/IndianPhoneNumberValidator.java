package validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class IndianPhoneNumberValidator implements ConstraintValidator<IndianPhoneNumber,String> {

    @Override
    public boolean isValid(String s, ConstraintValidatorContext constraintValidatorContext) {
        if (s == null) return false;
        return s.matches("^[6-9][0-9]{9}$");
    }
}
