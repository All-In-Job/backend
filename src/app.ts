import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { Controllers } from './apis/index';
import passport from 'passport';
import kakao from './apis/auth/strategies/kakao.strategy';
import google from './apis/auth/strategies/google.strategy';
import naver from './apis/auth/strategies/naver.strategy';
import session from 'express-session';

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(passport.initialize());

app.use(
    session({
        secret: process.env.SESSION_SECRET_KEY!,
        resave: false,
        saveUninitialized: false,
    }),
);

Controllers.map((contoller) => {
    app.use(contoller.path, contoller.router);
});

passport.serializeUser((user: any, done) => {
    done(null, user);
});

passport.deserializeUser((user: any, done) => {
    done(null, user);
});

google();
naver();
kakao();

app.get('/', (_, res) => {
    res.send('안녕!!!!!!!!!!!!!');
});

app.listen(process.env.PORT, () => {
    console.log('🐶🐶🐶🐶🐶백엔드 오픈🐶🐶🐶🐶🐶', process.env.PORT);
});
