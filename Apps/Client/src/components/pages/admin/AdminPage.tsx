import { Button, Paper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Severity } from '../../../types/CommonTypes';
import useHomePageStyles from '../home/HomePageStyles';
import Snackbar from '../../Snackbar';
import LogoutIcon from '@mui/icons-material/Logout';
import RefreshIcon from '@mui/icons-material/Refresh';
import PasswordIcon from '@mui/icons-material/Key';
import DatabaseIcon from '@mui/icons-material/Storage';
import PeopleIcon from '@mui/icons-material/People';
import DeleteIcon from '@mui/icons-material/Delete';
import useAuth from '../../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { getURL, Page } from '../../../routes/Router';
import useSecret from '../../../hooks/useSecret';
import Spinner from '../../Spinner';
import LoadingButton from '../../buttons/LoadingButton';
import useDatabase from '../../../hooks/useDatabase';
import YesNoDialog from '../../dialogs/YesNoDialog';

interface Props {

}

const AdminPage: React.FC<Props> = () => {
    const { classes } = useHomePageStyles();

    const { userEmail, setIsLogged, signOut } = useAuth();

    const secret = useSecret();
    const db = useDatabase();

    const [isSigningOut, setIsSigningOut] = useState(false);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const [isFlushDatabaseConfirmDialogOpen, setIsFlushDatabaseConfirmDialogOpen] = useState(false);
    const openFlushDatabaseConfirmDialog = () => setIsFlushDatabaseConfirmDialogOpen(true);
    const closeFlushDatabaseConfirmDialog = () => setIsFlushDatabaseConfirmDialogOpen(false);

    const [isDeleteAccountConfirmDialogOpen, setIsDeleteAccountConfirmDialogOpen] = useState(false);
    const openDeleteAccountConfirmDialog = () => setIsDeleteAccountConfirmDialogOpen(true);
    const closeDeleteAccountConfirmDialog = () => setIsDeleteAccountConfirmDialogOpen(false);

    const [isSignOutConfirmDialogOpen, setIsSignOutConfirmDialogOpen] = useState(false);
    const openSignOutConfirmDialog = () => setIsSignOutConfirmDialogOpen(true);
    const closeSignOutConfirmDialog = () => setIsSignOutConfirmDialogOpen(false);

    // Fetch secret on load
    useEffect(() => {
        secret.fetch();
    }, []);

    // Update snackbar on new error
    useEffect(() => {
        if (secret.error !== '') {
            setSnackbarMessage(secret.error);
            setSnackbarOpen(true);
        }
    }, [secret.error]);

    const handleRenewSecret = async () => {
        setSnackbarOpen(false);

        await secret.fetch(true);
    }

    const handleSignOut = async () => {
        setSnackbarOpen(false);
        setIsSigningOut(true);

        return signOut()
            .catch((err) => {
                setSnackbarMessage(err.message);
                setSnackbarOpen(true);
            })
            .finally(() => {
                setIsSigningOut(false);
            });
    }

    const handleDeleteAccount = async () => {
        setSnackbarOpen(false);

        closeDeleteAccountConfirmDialog();

        return db.deleteUser(userEmail)
            .catch((err) => {
                setSnackbarMessage(err.message);
                setSnackbarOpen(true);
            })
            .finally(() => {
                setIsLogged(false);
            });
    }

    const handleFlushDatabase = async () => {
        setSnackbarOpen(false);

        closeFlushDatabaseConfirmDialog();

        return db.flush()
            .catch((err) => {
                setSnackbarMessage(err.message);
                setSnackbarOpen(true);
            })
            .finally(() => {
                setIsLogged(false);
            });
    }

    // No secret yet: wait
    if (!secret.value) {
        return (
            <Spinner size='large' />
        );
    }

    return (
        <>
            <YesNoDialog
                open={isFlushDatabaseConfirmDialogOpen}
                title='Flush database'
                text='Are you sure you want to delete all database entries? This cannot be undone! You will then be logged out and redirected to the home page.'
                handleYes={handleFlushDatabase}
                handleNo={closeFlushDatabaseConfirmDialog}
                handleClose={closeFlushDatabaseConfirmDialog}
            />
            <YesNoDialog
                open={isDeleteAccountConfirmDialogOpen}
                title='Delete account'
                text='Are you sure you want to delete your account? This cannot be undone! You will then be logged out and redirected to the home page.'
                handleYes={handleDeleteAccount}
                handleNo={closeDeleteAccountConfirmDialog}
                handleClose={closeDeleteAccountConfirmDialog}
            />
            <YesNoDialog
                open={isSignOutConfirmDialogOpen}
                title='Sign out'
                text='Are you sure you want to sign out? You will be redirected to the home page.'
                handleYes={handleSignOut}
                handleNo={closeSignOutConfirmDialog}
                handleClose={closeSignOutConfirmDialog}
            />
            
            <Paper elevation={8} className={classes.root}>
                <Typography variant='h1' className={classes.title}>
                    Administration
                </Typography>
                
                <Typography className={classes.text}>
                    Hello, <strong>[{userEmail}]</strong>. You are logged in as an administrator. Here is your secret:
                </Typography>

                <Typography className={classes.secret}>
                    {secret.value}
                </Typography>

                <div className={classes.buttons}>
                    <LoadingButton
                        className={classes.button}
                        variant='contained'
                        color='primary'
                        icon={<RefreshIcon />}
                        loading={secret.isLoading}
                        onClick={handleRenewSecret}
                    >
                        Renew secret
                    </LoadingButton>

                    <Button
                        className={classes.button}
                        variant='contained'
                        color='primary'
                        component={Link}
                        to={getURL(Page.ResetPassword)}
                        startIcon={<PasswordIcon />}
                    >
                        Reset password
                    </Button>

                    <Button
                        className={classes.button}
                        variant='contained'
                        color='primary'
                        component={Link}
                        to={getURL(Page.Users)}
                        startIcon={<PeopleIcon />}
                    >
                        List users
                    </Button>

                    <LoadingButton
                        className={classes.button}
                        variant='contained'
                        color='error'
                        icon={<DeleteIcon />}
                        loading={db.isDeletingUser}
                        onClick={openDeleteAccountConfirmDialog}
                    >
                        Delete account
                    </LoadingButton>

                    <LoadingButton
                        className={classes.button}
                        variant='contained'
                        color='error'
                        icon={<DatabaseIcon />}
                        loading={db.isFlushing}
                        onClick={openFlushDatabaseConfirmDialog}
                    >
                        Flush database
                    </LoadingButton>
                    
                    <LoadingButton
                        className={classes.button}
                        variant='outlined'
                        color='secondary'
                        icon={<LogoutIcon />}
                        loading={isSigningOut}
                        onClick={openSignOutConfirmDialog}
                    >
                        Sign out
                    </LoadingButton>
                </div>

                <Snackbar
                    open={snackbarOpen}
                    message={snackbarMessage}
                    severity={Severity.Error}
                    onClose={() => setSnackbarOpen(false)}
                />
            </Paper>
        </>
    );
}

export default AdminPage;