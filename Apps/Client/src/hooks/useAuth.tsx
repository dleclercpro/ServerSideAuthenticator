import { createContext, ReactElement, useContext, useState } from 'react';
import { ServerError, translateServerError } from '../errors/ServerErrors';
import * as CallSignIn from '../models/calls/auth/CallSignIn';
import * as CallSignOut from '../models/calls/auth/CallSignOut';
import * as CallPing from '../models/calls/user/CallPing';
import * as CallResetPassword from '../models/calls/auth/CallResetPassword';
import * as CallForgotPassword from '../models/calls/auth/CallForgotPassword';
import * as CallConfirmEmail from '../models/calls/auth/CallConfirmEmail';
import * as CallSignUp from '../models/calls/auth/CallSignUp';

interface IAuthContext {
    errorPing: string,
    isPinging: boolean, // Determine whether user still has active session on server
    isLogged: boolean,
    isAdmin: boolean,
    setIsLogged: (isLogged: boolean) => void,
    setIsAdmin: (isAdmin: boolean) => void,
    ping: () => Promise<boolean>,
    signUp: (email: string, password: string) => Promise<void>,
    signIn: (email: string, password: string, staySignedIn: boolean) => Promise<boolean>,
    signOut: () => Promise<void>,
    confirmEmail: (token: string) => Promise<void>,
    forgotPassword: (email: string) => Promise<void>,
    resetPassword: (password: string, token?: string) => Promise<void>,
}

export const AuthContext = createContext<IAuthContext>({} as IAuthContext);



interface Props {
    children: ReactElement,
}

export const AuthContextProvider: React.FC<Props> = (props) => {
    const { children } = props;

    const auth = useAuth();
    
    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
}

export default function AuthContextConsumer() {
    return useContext(AuthContext);
}



const useAuth = () => {  
    const [errorPing, setErrorPing] = useState('');
    const [isPinging, setIsPinging] = useState(false);
    const [isLogged, setIsLogged] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const ping = async () => {
        setIsPinging(true);

        try {
            const { data } = await new CallPing.default().execute()

            const admin = (data as CallPing.ResponseData).isAdmin;

            setIsAdmin(admin);
            setIsLogged(true);

            setErrorPing('');

            return admin;
        } catch (err: any) {
            setIsLogged(false);
            setIsAdmin(false);

            // Invalid credentials error is normal when user not logged in: ignore error
            if (err.error === ServerError.InvalidCredentials) {
                return false;
            }

            setErrorPing(err.message);

            return false;
        } finally {
            setIsPinging(false);
        }
    }

    const signUp = async (email: string, password: string) => {
        await new CallSignUp.default()
            .execute({ email, password })
            .then(() => {

            })
            .catch(({ code, error, data }) => {
                throw new Error(translateServerError(error));
            });
    }

    const signIn = async (email: string, password: string, staySignedIn: boolean) => {
        const { data } = await new CallSignIn.default()
            .execute({ email, password, staySignedIn })
            .catch(({ code, error, data }) => {
                if (error === ServerError.NoMoreLoginAttempts) {
                    const { attempts, maxAttempts } = data;

                    throw new Error(translateServerError(error)
                        .replace('{{ ATTEMPTS }}', attempts)
                        .replace('{{ MAX_ATTEMPTS }}', maxAttempts)
                    );
                }

                throw new Error(translateServerError(error));
            });

        const admin = (data as CallSignIn.ResponseData).isAdmin;

        setIsAdmin(admin);
        setIsLogged(true);

        return admin;
    }

    const signOut = async () => {
        await new CallSignOut.default()
            .execute()
            .then(() => {

            })
            .catch(({ code, error, data }) => {
                throw new Error(translateServerError(error));
            })
            .finally(() => {
                setIsLogged(false);
                setIsAdmin(false);
            });
    }

    const confirmEmail = async (token: string) => {
        await new CallConfirmEmail.default(token)
            .execute()
            .then(() => {

            })
            .catch(({ code, error, data }) => {
                throw new Error(translateServerError(error));
            });
    }

    const forgotPassword = async (email: string) => {
        await new CallForgotPassword.default()
            .execute({ email })
            .then(() => {

            })
            .catch(({ code, error, data }) => {
                throw new Error(translateServerError(error));
            });
    }

    const resetPassword = async (password: string, token?: string) => {

        // No need for token when logged in
        if (isLogged) {
            await new CallResetPassword.default()
                .execute({ password })
                .then(() => {

                })
                .catch(({ code, error, data }) => {
                    throw new Error(translateServerError(error));
                });

            return;
        }

        // Need token to reset password when logged out
        if (!token) {
            throw new Error('MISSING_TOKEN');
        }

        await new CallResetPassword.default(token)
            .execute({ password })
            .then(() => {

            })
            .catch(({ code, error, data }) => {
                throw new Error(translateServerError(error));
            });
    }

    return {
        isPinging,
        errorPing,
        isLogged,
        isAdmin,
        setIsLogged,
        setIsAdmin,
        ping,
        signUp,
        signIn,
        signOut,
        confirmEmail,
        forgotPassword,
        resetPassword,
    };
}