import { useState } from 'react';
import * as CallEditUser from '../models/calls/user/CallEditUser';
import * as CallDeleteUser from '../models/calls/user/CallDeleteUser';
import { translateServerError } from '../errors/ServerErrors';
import { UserType } from '../constants';

const useUser = (email: string) => {    
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    const ban = async () => {
        setIsEditing(true);

        return new CallEditUser.default().execute({ email, ban: true })
            .then(({ data }) => {

            })
            .catch(({ code, error, data }) => {
                const err = translateServerError(error);

                setError(err);

                throw new Error(err);
            })
            .finally(() => {
                setIsEditing(false);
            });
    };

    const unban = async () => {
        setIsEditing(true);

        return new CallEditUser.default().execute({ email, ban: false })
            .then(({ data }) => {

            })
            .catch(({ code, error, data }) => {
                const err = translateServerError(error);

                setError(err);

                throw new Error(err);
            })
            .finally(() => {
                setIsEditing(false);
            });
    };

    const addToFavorites = async () => {
        setIsEditing(true);

        return new CallEditUser.default().execute({ email, favorite: true })
            .then(({ data }) => {

            })
            .catch(({ code, error, data }) => {
                const err = translateServerError(error);

                setError(err);

                throw new Error(err);
            })
            .finally(() => {
                setIsEditing(false);
            });
    };

    const removeFromFavorites = async () => {
        setIsEditing(true);

        return new CallEditUser.default().execute({ email, favorite: false })
            .then(({ data }) => {

            })
            .catch(({ code, error, data }) => {
                const err = translateServerError(error);

                setError(err);

                throw new Error(err);
            })
            .finally(() => {
                setIsEditing(false);
            });
    };

    const infirmEmail = async () => {
        setIsEditing(true);

        return new CallEditUser.default().execute({ email, confirm: false })
            .then(({ data }) => {

            })
            .catch(({ code, error, data }) => {
                const err = translateServerError(error);

                setError(err);

                throw new Error(err);
            })
            .finally(() => {
                setIsEditing(false);
            });
    };

    const confirmEmail = async () => {
        setIsEditing(true);

        return new CallEditUser.default().execute({ email, confirm: true })
            .then(({ data }) => {

            })
            .catch(({ code, error, data }) => {
                const err = translateServerError(error);

                setError(err);

                throw new Error(err);
            })
            .finally(() => {
                setIsEditing(false);
            });
    };

    const demoteToRegular = async () => {
        setIsEditing(true);

        return new CallEditUser.default().execute({ email, type: UserType.Regular })
            .then(({ data }) => {

            })
            .catch(({ code, error, data }) => {
                const err = translateServerError(error);

                setError(err);

                throw new Error(err);
            })
            .finally(() => {
                setIsEditing(false);
            });
    };

    const promoteToAdmin = async () => {
        setIsEditing(true);

        return new CallEditUser.default().execute({ email, type: UserType.Admin })
            .then(({ data }) => {

            })
            .catch(({ code, error, data }) => {
                const err = translateServerError(error);

                setError(err);

                throw new Error(err);
            })
            .finally(() => {
                setIsEditing(false);
            });
    };

    const deleteUser = async () => {
        setIsDeleting(true);

        return await new CallDeleteUser.default().execute({ email })
            .then(() => {

            })
            .catch(({ code, error, data }) => {
                throw new Error(translateServerError(error));
            })
            .finally(() => {
                setIsDeleting(false);
            });
    };

    return {
        error,
        isEditing,
        isDeleting,
        demoteToRegular,
        promoteToAdmin,
        infirmEmail,
        confirmEmail,
        ban,
        unban,
        addToFavorites,
        removeFromFavorites,
        delete: deleteUser,
    };
}

export default useUser;