package com.m4c1.greenbull.security.error;

public final class UserAlreadyExistException extends RuntimeException {

    private static final long serialVersionUID = 6584521565874213568L;

    public UserAlreadyExistException() {
        super();
    }

    public UserAlreadyExistException(final String message, final Throwable cause) {
        super(message, cause);
    }

    public UserAlreadyExistException(final String message) {
        super(message);
    }

    public UserAlreadyExistException(final Throwable cause) {
        super(cause);
    }

}
