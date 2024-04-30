import randomWords from 'random-words';
import { APP_DB } from '../..';
import PasswordManager from './PasswordManager';
import UserPassword from './UserPassword';
import UserLogin from './UserLogin';
import UserEmail from './UserEmail';

const getRandomWord = () => randomWords({ exactly: 1, join: `` });

interface UserArgs {
    email: UserEmail,
    password: UserPassword,
    login: UserLogin,
    secret: string,
}



class User {
    protected email: UserEmail;
    protected password: UserPassword;
    protected login: UserLogin;
    protected secret: string;

    public constructor(args: UserArgs) {
        this.email = args.email;
        this.login = args.login;
        this.password = args.password;
        this.secret = args.secret;
    }

    public serialize() {
        return JSON.stringify({
            email: this.email.serialize(),
            password: this.password.serialize(),
            login: this.login.serialize(),
            secret: this.secret,
        });
    }

    public static deserialize(str: string) {
        const args = JSON.parse(str);

        const user = new User({
            ...args,
            email: UserEmail.deserialize(args.email),
            password: UserPassword.deserialize(args.password),
            login: UserLogin.deserialize(args.login),
        });

        return user;
    }

    public stringify() {
        return this.getEmail().getValue();
    }

    public getId() {
        return this.getEmail().getValue();
    }

    public getEmail() {
        return this.email;
    }

    public getPassword() {
        return this.password;
    }

    public getLogin() {
        return this.login;
    }

    public getSecret() {
        return this.secret;
    }

    public async renewSecret() {
        this.secret = getRandomWord();

        await this.save();

        return this.secret;
    }

    public async save() {
        await APP_DB.set(`user:${this.email.getValue()}`, this.serialize());
    }

    public async delete() {
        await APP_DB.delete(`user:${this.email.getValue()}`);
    }

    // STATIC METHODS
    public static async findByEmail(email: string) {
        const userAsString = await APP_DB.get(`user:${email}`);

        if (userAsString) {
            return User.deserialize(userAsString);
        }
    }

    public static async create(email: string, password: string) {

        // Create new user
        const user = new User({
            email: new UserEmail({
                value: email,
            }),
            password: new UserPassword({
                value: await PasswordManager.hash(password),
            }),
            login: new UserLogin({}),
            secret: getRandomWord(),
        });

        // Store user in database
        await user.save();

        return user;
    }
}

export default User;