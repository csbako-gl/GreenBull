package com.m4c1.greenbull.security.error;

public class InvalidMatchingPasswordException extends RuntimeException {

    private static final long serialVersionUID = 5565621688423125843L;

    public InvalidMatchingPasswordException() {
        super();
    }

    public InvalidMatchingPasswordException(final String message, final Throwable cause) {
        super(message, cause);
    }

    public InvalidMatchingPasswordException(final String message) {
        super(message);
    }

    public InvalidMatchingPasswordException(final Throwable cause) {
        super(cause);
    }

}
