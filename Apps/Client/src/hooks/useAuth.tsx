import { createContext, ReactElement, useContext, useState } from 'react';
import { CallSignIn } from '../models/calls/auth/CallSignIn';
import { CallSignOut } from '../models/calls/auth/CallSignOut';
import { CallPing } from '../models/calls/user/CallPing';
import { CallResetPassword } from '../models/calls/auth/CallResetPassword';
import { CallForgotPassword } from '../models/calls/auth/CallForgotPassword';
import { ServerError, translateServerError } from '../errors/ServerErrors';
import { CallConfirmEmail } from '../models/calls/auth/CallConfirmEmail';
import { CallSignUp } from '../models/calls/auth/CallSignUp';

interface IAuthContext {
    isPinged: boolean, // Determine whether user still has active session on server
    isLogged: boolean,
    ping: () => Promise<void>,
    signUp: (email: string, password: string) => Promise<void>,
    signIn: (email: string, password: string, staySignedIn: boolean) => Promise<void>,
    signOut: () => Promise<void>,
    confirmEmail: (token: string) => Promise<void>,
    forgotPassword: (email: string) => Promise<void>,
    resetPassword: (token: string, password: string) => Promise<void>,
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
    const [isPinged, setIsPinged] = useState(false);
    const [isLogged, setIsLogged] = useState(false);

    const ping = async () => {
        try {
            await new CallPing().execute();
            setIsLogged(true);
        } catch (err: any) {
            setIsLogged(false);
        } finally {
            setIsPinged(true);
        }
    }

    const signUp = async (email: string, password: string) => {
        await new CallSignUp().execute({ email, password })
        .then(() => {

        })
        .catch(({ code, error, data }) => {
            throw new Error(translateServerError(error));
        });
    }

    const signIn = async (email: string, password: string, staySignedIn: boolean) => {
        await new CallSignIn().execute({ email, password, staySignedIn })
            .then(() => {
                setIsLogged(true);
            })
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
    }

    const signOut = async () => {
        await new CallSignOut().execute()
            .catch(({ code, error, data }) => {
                throw new Error(translateServerError(error));
            })
            .finally(() => {
                setIsLogged(false);
            });
    }

    const confirmEmail = async (token: string) => {
        await new CallConfirmEmail(token).execute()
            .catch(({ code, error, data }) => {
                throw new Error(translateServerError(error));
            });
    }

    const forgotPassword = async (email: string) => {
        await new CallForgotPassword().execute({ email })
            .catch(({ code, error, data }) => {
                throw new Error(translateServerError(error));
            });
    }

    const resetPassword = async (token: string, password: string) => {
        await new CallResetPassword(token).execute({ password })
            .catch(({ code, error, data }) => {
                throw new Error(translateServerError(error));
            });
    }

    return {
        isPinged,
        isLogged,
        ping,
        signUp,
        signIn,
        signOut,
        confirmEmail,
        forgotPassword,
        resetPassword,
    };
}