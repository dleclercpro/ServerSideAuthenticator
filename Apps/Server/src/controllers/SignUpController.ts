import { validate } from 'email-validator';
import { RequestHandler } from 'express';
import { ErrorInvalidEmail, ErrorInvalidPassword } from '../errors/ServerError';
import { ErrorUserAlreadyExists } from '../errors/UserErrors';
import { errorResponse, successResponse } from '../utils/calls';
import { HttpStatusCode } from '../types/HTTPTypes';
import PasswordManager from '../models/auth/PasswordManager';
import { ClientError } from '../constants';
import { logger } from '../utils/logger';
import User from '../models/auth/User';
import Gmailer from '../models/emails/Gmailer';
import EmailFactory from '../models/emails/EmailFactory';

const SignUpController: RequestHandler = async (req, res, next) => {
    let { email, password } = req.body;
    
    try {
        // Sanitize input
        email = email.trim().toLowerCase();

        // Validate e-mail
        if (!validate(email)) {
            throw new ErrorInvalidEmail(email);
        }

        // Validate password
        if (!PasswordManager.validate(password)) {
            throw new ErrorInvalidPassword();
        }
        
        // Ensure user doesn't already exist
        let user = await User.findByEmail(email);
        if (user) {
            throw new ErrorUserAlreadyExists(user);
        }
        
        // Create new user instance
        user = await User.create(email, password);
        logger.info(`New user created: ${user.getEmail().getValue()}`);

        // Send e-mail confirmation e-mail to new user
        await Gmailer.send(await EmailFactory.createConfirmationEmail(user));
        logger.debug(`Confirmation e-mail sent to user: ${user.getEmail().getValue()}`);

        return res.json(successResponse());

    } catch (err: any) {

        // User already exists
        if (err.code === ErrorUserAlreadyExists.code) {
            return res
                .status(HttpStatusCode.FORBIDDEN)
                .json(errorResponse(ClientError.UserAlreadyExists));
        }

        // Invalid email
        if (err.code === ErrorInvalidEmail.code) {
            return res
                .status(HttpStatusCode.BAD_REQUEST)
                .json(errorResponse(ClientError.InvalidEmail));
        }

        // Invalid password
        if (err.code === ErrorInvalidPassword.code) {
            return res
                .status(HttpStatusCode.BAD_REQUEST)
                .json(errorResponse(ClientError.InvalidPassword));
        }

        next(err);
    }
}

export default SignUpController;