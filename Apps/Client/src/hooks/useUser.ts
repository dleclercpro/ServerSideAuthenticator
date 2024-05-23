import { useState } from 'react';
import * as CallEditUser from '../models/calls/user/CallEditUser';
import { translateServerError } from '../errors/ServerErrors';
import { UserType } from '../constants';

const useUser = () => {    
    const [isEditingUser, setIsEditingUser] = useState(false);
    const [error, setError] = useState('');

    const demoteUserToRegular = async (email: string) => {
        setIsEditingUser(true);

        return new CallEditUser.default().execute({ email, type: UserType.Regular })
            .then(({ data }) => {

            })
            .catch(({ code, error, data }) => {
                const err = translateServerError(error);

                setError(err);

                throw new Error(err);
            })
            .finally(() => {
                setIsEditingUser(false);
            });
    };

    const promoteUserToAdmin = async (email: string) => {
        setIsEditingUser(true);

        return new CallEditUser.default().execute({ email, type: UserType.Admin })
            .then(({ data }) => {

            })
            .catch(({ code, error, data }) => {
                const err = translateServerError(error);

                setError(err);

                throw new Error(err);
            })
            .finally(() => {
                setIsEditingUser(false);
            });
    };

    return {
        error,
        isEditingUser,
        demoteUserToRegular,
        promoteUserToAdmin,
    };
}

export default useUser;