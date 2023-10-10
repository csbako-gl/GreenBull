package com.m4c1.greenbull.api_gateway;

public class RestException extends RuntimeException {

    private static final long serialVersionUID = 6145692236548665125L;

    private final String messageKey;
    private final Object[] params;

    public RestException(String messageKey, Object... parameters) {
        this(null, messageKey, parameters);
    }

    public RestException(Throwable cause, String messageKey, Object... parameters) {
        super(cause);
        this.messageKey = messageKey;
        this.params = parameters;
    }

    public Object[] getParams() {
        return params;
    }

    @Override
    public String getMessage() {
        return toString();
    }

    public String getMessageKey() {
        return messageKey;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        Throwable cause = getCause();
        if (messageKey != null) {
            sb.append("MESSAGE: ");
            sb.append(messageKey);
        }
        if (cause != null) {
            if (sb.length() != 0) {
                sb.append(" ");
            }
            sb.append("CAUSE: ");
            sb.append(cause.toString());
        }
        return sb.toString();
    }
}