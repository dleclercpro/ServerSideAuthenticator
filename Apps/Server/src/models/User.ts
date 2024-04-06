import * as bcrypt from 'bcrypt';
import randomWords from 'random-words';
import { N_PASSWORD_SALT_ROUNDS } from '../config/AuthConfig';
import { USER_DB } from '..';

const getRandomWord = () => randomWords({ exactly: 1, join: `` });

type UserTokens = Record<string, string>;

interface UserArgs {
    email: string, password: string, secret: string, tokens: UserTokens,
}

class User {
    protected email: string;
    protected password: string;
    protected secret: string;
    protected tokens: UserTokens;

    public constructor(args: UserArgs) {
        this.email = args.email;
        this.password = args.password;
        this.secret = args.secret;
        this.tokens = {};
    }

    public serialize() {
        return JSON.stringify({
            email: this.email,
            password: this.password,
            secret: this.secret,
            tokens: this.tokens,
        });
    }

    public static deserialize(str: string) {
        return new User(JSON.parse(str));
    }

    public stringify() {
        return this.getEmail();
    }

    public getId() {
        return this.getEmail();
    }

    public getEmail() {
        return this.email;
    }

    public getPassword() {
        return this.password;
    }

    public getSecret() {
        return this.secret;
    }

    public getTokens() {
        return this.tokens;
    }

    public async setToken(name: string, value: string) {
        this.tokens[name] = value;

        await this.save();
    }

    public async renewSecret() {
        this.secret = getRandomWord();

        await this.save();
    }

    public async isPasswordValid(password: string) {
        return bcrypt.compare(password, this.password);
    }

    public static async hashPassword(password: string) {
        const hashedPassword = await bcrypt.hash(password, N_PASSWORD_SALT_ROUNDS);

        return hashedPassword;
    }

    public async resetPassword(newPassword: string) {
        this.password = await User.hashPassword(newPassword);

        await this.save();
    }

    public async save() {
        USER_DB.add(`user:${this.email}`, this.serialize());
    }

    public async delete() {
        USER_DB.remove(this.email);
    }

    // STATIC METHODS
    public static async findByEmail(email: string) {
        const userAsString = await USER_DB.get(email);

        if (userAsString) {
            return User.deserialize(userAsString);
        }
    }

    public static async create(email: string, password: string) {

        // Create new user
        const user = new User({
            email,
            password: await User.hashPassword(password),
            secret: getRandomWord(),
            tokens: {},
        });

        // Store user in database
        USER_DB.add(user.getId(), user.serialize());

        return user;
    }
}

export default User;