import { Response } from 'express';
import { url } from './callbackUrl';

export const saveCookie = (res: Response, key: string, value: string) => {
    if (url().origin) {
        // 배포 환경
        res.setHeader('Access-Control-Allow-Origin', 'https://allinjob.co.kr');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader(
            'Set-Cookie',
            `${key}=${value};path=/; domain=.backallinjob.co.kr; SameSite=None; Secure; httpOnly`,
        );
    } else {
        // 로컬 환경
        const domain = `${key}=${value}; path=/;`;
        res.setHeader(
            'Set-Cookie',
            `${domain}${key === 'refreshToken' && ' Max-Age=3600'}`,
        );
    }
};
