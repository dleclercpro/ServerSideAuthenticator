export abstract class ServerError extends Error {
    public code: number;
    
    constructor(code: number, message: string) {
        super(message);

        this.code = code;
    }
}



// Generic errors
export class ErrorInvalidEmail extends ServerError {
    public static code = -100;
    
    constructor(email: string) {
        super(ErrorInvalidEmail.code, `Invalid e-mail provided: ${email}`);
    }
}

export class ErrorInvalidPassword extends ServerError {
    public static code = -101;
    
    constructor() {
        super(ErrorInvalidPassword.code, `Invalid password provided.`);
    }
}

export class ErrorInvalidToken extends ServerError {
    public static code = -102;

    constructor() {
        super(ErrorInvalidToken.code, `Invalid token provided.`);
    }
}

export class ErrorMissingToken extends ServerError {
    public static code = -103;

    constructor() {
        super(ErrorMissingToken.code, `Missing token.`);
    }
}

export class ErrorExpiredToken extends ServerError {
    public static code = -104;

    constructor() {
        super(ErrorExpiredToken.code, `Expired token.`);
    }
}