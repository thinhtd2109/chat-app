import dotenv from 'dotenv';
import bunyan from 'bunyan';

import cloudinary from 'cloudinary';

dotenv.config();

class Config {
    public DATABASE_URL: string;
    public JWT_TOKEN: string;
    public NODE_ENV: string;
    public SECRET_KEY_ONE: string;
    public SECRET_KEY_TWO: string;
    public CLIENT_URL: string;
    public PORT: number;
    public REDIS_HOST: string;
    public CLOUD_NAME: string;
    public CLOUD_API_KEY: string;
    public CLOUD_API_SECRET: string;
    public SENDGRID_API_KEY: string;

    public SENDER_EMAIL: string
    public SENDER_EMAIL_PASSWORD: string;
    public SENGRID_SENDER: string;

    private readonly DEFAULT_DATABASE_URL = "mongodb+srv://thinhtd2109:cuocsongma1@cluster0.wrw9p.mongodb.net/chatdb";

    constructor() {
        this.SENDER_EMAIL = process.env.SENDER_EMAIL!;
        this.SENDER_EMAIL_PASSWORD = process.env.SENDER_EMAIL_PASSWORD!;
        this.SENGRID_SENDER = process.env.SENGRID_SENDER!;
        this.SENDGRID_API_KEY = process.env.SENDGRID_API_KEY!;
        this.CLOUD_NAME = process.env.CLOUD_NAME!;
        this.CLOUD_API_KEY = process.env.CLOUD_API_KEY!;
        this.CLOUD_API_SECRET = process.env.CLOUD_API_SECRET!;
        this.REDIS_HOST = process.env.REDIS_HOST || 'http://localhost:6379';
        this.PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000
        this.DATABASE_URL = process.env.DATABASE_URL || this.DEFAULT_DATABASE_URL
        this.JWT_TOKEN = process.env.JWT_TOKEN || 'default01'
        this.NODE_ENV = process.env.NODE_ENV || 'development'
        this.SECRET_KEY_ONE = process.env.SECRET_KEY_ONE || 'default-secret-key01'
        this.SECRET_KEY_TWO = process.env.SECRET_KEY_TWO || 'default-secret-key02'
        this.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000'
    }

    public createLogger(name: string) {
        return bunyan.createLogger({ name, level: 'debug' })
    }

    public validateConfig(): void {
        for (const [key, value] of Object.entries(this)) {
            if (value == undefined) {
                throw new Error(`Config ${key} không hợp lệ.`);
            }
        }
    }

    public cloudinaryConfig() {
        cloudinary.v2.config({
            cloud_name: this.CLOUD_NAME,
            api_key: this.CLOUD_API_KEY,
            api_secret: this.CLOUD_API_SECRET
        });


    }
}

export const config: Config = new Config();