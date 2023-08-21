import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

prisma
    .$connect()
    .then(() => {
        console.log('connected');
    })
    .catch((err) => {
        console.log(err);
    });

export default prisma;
