import { Button, Paper, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Severity } from '../../../types/CommonTypes';
import useAuthStyles from '../AuthStyles';
import Snackbar from '../../Snackbar';
import PasswordField from '../../fields/PasswordField';
import LoadingButton from '../../buttons/LoadingButton';
import ResetIcon from '@mui/icons-material/LockReset';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import { translateServerError } from '../../../errors/ServerErrors';
import { Page, getURL } from '../../../routes/Router';
import EmailField from '../../fields/EmailField';
import { sleep } from '../../../utils/time';
import TimeDuration from '../../../models/TimeDuration';
import { TimeUnit } from '../../../types/TimeTypes';

interface Props {

}

const ResetPassword: React.FC<Props> = () => {
    const { classes } = useAuthStyles();
    
    const location = useLocation();
    const navigate = useNavigate();

    const queryParams = new URLSearchParams(location.search);

    const { resetPassword } = useAuth();

    const email = queryParams.get('email') ?? '';
    const token = queryParams.get('token') ?? '';

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');

    const [snackbarOpen, setSnackbarOpen] = useState(!!error);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // New error: open snackbar
    useEffect(() => {
        if (!!error) {
            setSnackbarOpen(true);
        }
        
    }, [error]);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        setError(false);
    }

    const handleRepeatPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRepeatPassword(e.target.value);
        setError(false);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (token === null) {
            return;
        }

        if (password !== repeatPassword) {
            setError(true);
            setSnackbarMessage('Passwords must match!');
            return;
        }

        setSnackbarOpen(false);
        setLoading(true);

        return resetPassword(token, password)
            .then(() => {
                setError(false);
                setSnackbarMessage('Your password has been successfully reset!');
                setSnackbarOpen(true);

                return sleep(new TimeDuration(5, TimeUnit.Second));
            })
            .then(() => {
                navigate(getURL(Page.Home));
            })
            .catch((err: any) => {
                const error = translateServerError(err.message);

                setError(true);
                setSnackbarMessage(error);
                setSnackbarOpen(true);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    /* No token provided: go back home */
    if (token === null) {
        return (
            <Navigate to={getURL(Page.Home)} />
        );
    }

    return (
        <Paper elevation={8} className={classes.root}>
            <form
                className={`${classes.form} reset-password`}
                autoComplete='off'
                onSubmit={handleSubmit}
            >
                <Typography variant='h1' className={classes.title}>
                    Reset your password
                </Typography>

                <Typography className={classes.text}>
                    Please choose a new password for your account:
                </Typography>

                <fieldset className={classes.fields}>
                    <EmailField
                        id='email'
                        className={classes.field}
                        value={email}
                        error={!!error}
                        disabled
                        onChange={() => {}}
                    />

                    <PasswordField
                        id='password'
                        className={classes.field}
                        value={password}
                        error={!!error}
                        onChange={handlePasswordChange}
                    />

                    <PasswordField
                        id='password-repeat'
                        className={classes.field}
                        label='Repeat password'
                        value={repeatPassword}
                        error={!!error}
                        onChange={handleRepeatPasswordChange}
                    />
                </fieldset>

                <div className={classes.buttons}>
                    <div className='top'>
                        <LoadingButton
                            className={classes.submitButton}
                            type='submit'
                            icon={<ResetIcon />}
                            loading={loading}
                            error={!!error}
                        >
                            Reset password
                        </LoadingButton>
                    </div>
                    <div className='bottom'>
                        <Button
                            className={classes.linkButton}
                            component={Link}
                            to={getURL(Page.Home)}
                            color='secondary'
                        >
                            Go back home
                        </Button>
                    </div>
                </div>
            </form>

            <Snackbar
                open={snackbarOpen}
                message={snackbarMessage}
                severity={!!error ? Severity.Error : Severity.Info}
                onClose={() => setSnackbarOpen(false)}
            />
        </Paper>
    );
}

export default ResetPassword;