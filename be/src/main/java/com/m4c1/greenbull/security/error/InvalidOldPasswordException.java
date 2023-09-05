package com.m4c1.greenbull.security.error;

public class InvalidOldPasswordException extends RuntimeException {

    private static final long serialVersionUID = 5562445689864451223L;

    public InvalidOldPasswordException() {
        super();
    }

    public InvalidOldPasswordException(final String message, final Throwable cause) {
        super(message, cause);
    }

    public InvalidOldPasswordException(final String message) {
        super(message);
    }

    public InvalidOldPasswordException(final Throwable cause) {
        super(cause);
    }

}
