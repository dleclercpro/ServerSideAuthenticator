import http from 'http';
import express, { Router } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { logger } from '../utils/logger';
import { PORT, CLIENT_ROOT, DEV, PROD } from '../config/AppConfig';
import ErrorMiddleware from '../middleware/ErrorMiddleware';
import TimeDuration from './units/TimeDuration';
import { TimeUnit } from '../types/TimeTypes';
import { killAfterTimeout } from '../utils/process';



// There can only be one app server: singleton!
class AppServer {
    protected app?: express.Express;
    protected server?: http.Server;

    public async setup(router: Router) {
        this.app = express();
        this.server = http.createServer(this.app);
    
        // Enable use of cookies
        this.app.use(cookieParser());
    
        // Enable use of JSON data
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());
    
        // Enable HTTP response compression
        this.app.use(compression());

        // Allow all origins in dev mode
        if (DEV) {
            logger.debug(`Enabling CORS.`);

            const CORS_OPTIONS = {
                origin: CLIENT_ROOT,
                credentials: true,
            };

            this.app.use(cors(CORS_OPTIONS));
        }

        // Define server's API endpoints
        this.app.use('/', router);

        // Final error middleware
        this.app.use(ErrorMiddleware);
    }

    public getApp() {
        return this.app;
    }

    public getServer() {
        return this.server;
    }

    public async start() {
        if (!this.server) throw new Error('MISSING_SERVER');

        // Listen to stop signals
        process.on('SIGTERM', () => this.stop('SIGTERM'));
        process.on('SIGINT', () => this.stop('SIGINT'));

        // Listen to HTTP traffic on given port
        this.server!.listen(PORT, async () => {
            logger.debug(`Server listening on ${PROD ? 'container' : 'local'} port: ${PORT}`);
        });
    }

    public async stop(signal: string = '', timeout: TimeDuration = new TimeDuration(2, TimeUnit.Second)) {
        if (!this.server) throw new Error('MISSING_SERVER');

        if (signal) {
            logger.trace(`Received stop signal: ${signal}`);
        }

        // Force server shutdown after timeout
        await Promise.race([killAfterTimeout(timeout), async () => {
            
            // Shut down gracefully
            await new Promise<void>((resolve, reject) => {
                this.server!.close((err) => {
                    if (err) {
                        logger.warn(`Could not shut down server gracefully: ${err}`);
                        reject(err);
                    }

                    logger.debug(`Server shut down gracefully.`);
                    resolve();
                });
            });

            // Exit process
            process.exit(0);
        }]);
    }
}

export default AppServer;