import express from 'express';
import session from 'express-session';
import { Server, Socket } from 'socket.io';
import http from 'http';
import bodyParser from 'body-parser';
//import sharedSession from 'express-socket.io-session';
import cors from 'cors';
import sessionfile from 'session-file-store';

const FileStore = sessionfile(session);
const app = express();

// 5mb limit for document
app.use(bodyParser.json({ limit: '5mb' }));
app.use(express.json());

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5001',
    'https://studio.dhiway.com',
    'https://markdemo.dhiway.com',
    'https://studiodemo.dhiway.com',
];

const allowedDomains = [
    'localhost',
    'dhiway.com',
    'dway.io',
    'cord.network',
    'amplifyapp.com' /* For supporting quick hosting of UI */,
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            let tmpOrigin = origin;

            if (origin.slice(-1) === '/') {
                tmpOrigin = origin.substring(0, origin.length - 1);
            }
            if (allowedOrigins.indexOf(tmpOrigin) === -1) {
                /* Check if we should allow star/asteric */
                const b = tmpOrigin.split('/')[2].split('.');
                const domain = `${b[b.length - 2]}.${b[b.length - 1]}`;
                if (allowedDomains.indexOf(domain) === -1) {
                    console.log(tmpOrigin, domain);
                    var msg = `The CORS policy for this site (${origin}) does not allow access from the specified Origin.`;
                    return callback(new Error(msg), false);
                }
            }
            return callback(null, true);
        },
        optionsSuccessStatus: 200, // For legacy browser support
        credentials: true,
        preflightContinue: true,
        methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
        allowedHeaders: [
            'Content-Type',
            'X-UserId',
            'Accept',
            'Authorization',
            'user-agent',
            'Host',
            'X-Forwarded-For',
            'Upgrade',
            'Connection',
        ],
    })
);

const sessionStore: any = new FileStore({
    path: '/sessions',
    ttl: 7 * 24 * 60 * 60, // 7 days in seconds
    retries: 3,
});

console.log(app.get('env'));
if (app.get('env') === 'production') {
    app.set('trust proxy', 1); // trust first proxy
}

const sess = session({
    secret: '8e958024c5bace1f971a28cf6b82d4ffb0617e751fe9e484530f724b3fa00aec',
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in miliseconds
        secure: app.get('env') === 'production' ? true : false,
        sameSite: app.get('env') === 'production' ? 'none' : 'lax',
    },
    store: sessionStore,
    saveUninitialized: true,
    resave: true,
    rolling: true,
});

interface Role {
    name: string;
    user: string;
    org: string;
    folder: string;
}

declare module 'express-session' {
    interface SessionData {
        token: string;
        roles: Role[];
        email: string;
        userId: string;
        name: string;
        org: any;
        config: any;
        package: any;
        console: string | undefined;
    }
}

app.use(sess);

let sessionCount = 0;

app.use(function (req, res, next) {
    if (sessionStore) {
        sessionStore.length((err: any, len: number) => {
            sessionCount = len;
        });
    }
    return next();
});

export function numberOfSessions() {
    return sessionCount;
}

const server = http.createServer(app);
const io = new Server(server, {
    transports: ['websocket', 'polling'],
    cors: { credentials: true, origin: allowedOrigins },
});

/* depends on 'express-socket.io-session' */
/*
io.use(
    sharedSession(sess, {
        autoSave: true,
    })
);
*/

io.on('connection', function (socket: Socket) {
    if (socket.handshake) {
        /* need this circus because 'Handshake' Type definition doesn't have
	   session and sessionID in it. But when I see it while running, I see
	   the session and sessionID being present. With this below change, we
	   are able to communicate successfully with frontend. */
        const handshake: any = { ...socket.handshake };

        console.debug('Socket IO - Joining : ', handshake.sessionID);
        socket.join(handshake.sessionID);
    }
});

export { app, server, io, sessionStore };
