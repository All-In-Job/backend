import { Request, Response } from 'express';
import passport from 'passport';

// 카카오 로그인 페이지로 이동
export const kakaoMiddleware = passport.authenticate('kakao');

// passport 로그인 전략에 의해 kakakoStrategy로 가서 카카오계정 정보와 DB를 비교해서
// 회원가입시키거나 로그인 처리하게 된다.
export const kakaoMiddlewareRedirect = passport.authenticate(
    'kakao',
    {
        // 카카오 로그인 실패시 리다이렉트 주소
        // kakaoStrategy에서 실패한다면 실행
        failureRedirect: '/',
    },
    (req: Request, res: Response) => {
        // 카카오 로그인 성공시 리다이렉트 주소
        // kakaoStrategy에서 성공한다면 콜백 실행
        res.redirect('http://localhost:4000/login/kakao');
    },
);

// 구글
export const googleMiddleware = passport.authenticate('google', {
    scope: ['profile', 'email'],
});
export const googleMiddlewareRedirect = passport.authenticate(
    'google',
    {
        failureRedirect: '/',
    },
    (req: Request, res: Response) => {
        res.redirect('http://localhost:4000/login/google');
    },
);

// 네이버
export const naverMiddleware = passport.authenticate('naver');
export const naverMiddlewareRedirect = passport.authenticate(
    'naver',
    {
        failureRedirect: '/',
    },
    (req: Request, res: Response) => {
        res.redirect('http://localhost:4000/login/naver');
    },
);
