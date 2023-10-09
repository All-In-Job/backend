export const url = () => {
    // 배포
    // const domain = process.env.ORIGIN;
    // const origin = true;

    // 로컬
    const domain = process.env.LOCAL;
    const origin = false;

    return { domain, origin };
};
