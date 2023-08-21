import { Router } from 'express';
import {
    googleMiddleware,
    googleMiddlewareRedirect,
    kakaoMiddleware,
    naverMiddleware,
    naverMiddlewareRedirect,
} from '../../middleware/auth.middleware';
import { kakaoMiddlewareRedirect } from '../../middleware/auth.middleware';

class AuthController {
    router = Router();
    path = '/login';

    constructor() {
        this.init();
    }

    init() {
        // 카카오 로그인 이동
        // 카카오로 요청이 오면, 카카오 로그인 페이지로 가게 되고,
        // 카카오 서버를 통해 카카오 로그인을 하게 되면, 다음 라우터로 요청
        this.router.get('/kakao', kakaoMiddleware);
        // 카카오 로그인 리다이렉트 주소
        // 위에서 카카오 서버 로그인이 되면,
        // 카카오 redirect url 설정에 따라 이쪽 라우터로 오게 된다
        this.router.get('/kakao/callback', kakaoMiddlewareRedirect);

        //구글
        this.router.get('/google', googleMiddleware);
        this.router.get('/google/callback', googleMiddlewareRedirect);

        //네이버
        this.router.get('/naver', naverMiddleware);
        this.router.get('/naver/callback', naverMiddlewareRedirect);
    }
}

export default new AuthController();
