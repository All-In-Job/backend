import passport, { Profile } from 'passport';
import {
    Strategy as NaverStrategy,
    StrategyOption,
} from 'passport-naver';

const registerNaverStrategy = () => {
    passport.use(
        new NaverStrategy(
            {
                clientID: process.env.NAVER_CLIENT_ID,
                clientSecret: process.env.NAVER_CLIENT_SECRET,
                callbackURL: 'http://localhost:4000/login/naver',
            } as StrategyOption,
            async (
                accessToken: string,
                refreshToken: string,
                profile: Profile,
                done,
            ) => {
                console.log(accessToken, refreshToken, profile);
                done(accessToken, refreshToken, profile);
            },
        ),
    );
};

export default registerNaverStrategy;