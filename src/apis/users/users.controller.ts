import { CreateUserDTO } from './dto/create-user.dto';
import { UserService } from './users.service';
import { Request, Response, Router } from 'express';
import { SmsService } from '../../common/util/sms/sms.service';
import { SendTokenSmsDTO } from '../../common/util/sms/dto/sendTokenSMS.dto';
import { ValidateTokenDTO } from '../../common/util/sms/dto/validateToken.dto';
import { FindOneUserByEmailDTO } from './dto/findOneUserByEmail.dto';
import { validateDTO } from '../../common/validator/validateDTO';
import { FindOneUserByIdDTO } from './dto/findOneUserByID.dto';
import { email, findOneUserByIDType, idType } from '../../common/types';
import { asyncHandler } from '../../middleware/async.handler';
import { Container } from 'typedi';
import { CreateThermometerDTO } from './dto/create-thermometer.dto';
import accessGuard from '../../middleware/auth.guard/access.guard';

class UserController {
    router = Router();
    path = '/user';

    constructor(
        private readonly userService: UserService,
        private readonly smsService: SmsService,
    ) {
        this.init();
    }

    init() {
        this.router.get(
            '/findOneUserByEmail',
            asyncHandler(this.findOneUserByEmail.bind(this)),
        );

        this.router.get(
            '/findOneUserByID',
            asyncHandler(this.findOneUserByID.bind(this)),
        );

        this.router.post(
            '/createUser',
            asyncHandler(this.createUser.bind(this)),
        );

        this.router.post(
            '/sendTokenSMS',
            asyncHandler(this.sendTokenSMS.bind(this)),
        );

        this.router.post(
            '/validateToken',
            asyncHandler(this.validateToken.bind(this)),
        );

        this.router.post(
            '/createThermometer',
            accessGuard.handle,
            asyncHandler(this.createThermometer.bind(this)),
        );
    }

    async findOneUserByEmail(req: Request, res: Response) {
        // #swagger.tags = ['Users']
        const { email } = req.query as email;
        await validateDTO(new FindOneUserByEmailDTO({ email }));
        res.status(200).json({
            data: await this.userService.findOneUserByEmail(email),
        });
    }

    async findOneUserByID(req: Request, res: Response) {
        // #swagger.tags = ['Users']
        const { name, phone } = req.query as findOneUserByIDType;
        await validateDTO(new FindOneUserByIdDTO({ name, phone }));
        res.status(200).json({
            data: await this.userService.findOneUserByID({
                name,
                phone,
            }),
        });
    }

    async createUser(req: Request, res: Response) {
        // #swagger.tags = ['Users']
        await validateDTO(new CreateUserDTO(req.body));

        res.status(200).json({
            data: await this.userService.createUser({
                createDTO: req.body,
            }),
        });
    }

    async sendTokenSMS(req: Request, res: Response) {
        // #swagger.tags = ['Users']
        const { phone } = req.body;
        await validateDTO(new SendTokenSmsDTO({ phone }));
        res.status(200).json({
            data: await this.smsService.sendTokenSMS(phone),
        });
    }

    async validateToken(req: Request, res: Response) {
        // #swagger.tags = ['Users']
        await validateDTO(new ValidateTokenDTO(req.body));

        res.status(200).json({
            data: await this.smsService.validateToken(req.body),
        });
    }

    async createThermometer(req: Request, res: Response) {
        const { id } = req.user as idType;
        const { path, id: pathId } = req.body;

        await validateDTO(new CreateThermometerDTO({ path, pathId }));

        const datas = await this.userService.createThermometer({
            path,
            pathId,
            id,
        });
        res.status(200).json({
            data: {
                ...datas,
            },
        });
    }
}

export default new UserController(
    Container.get(UserService),
    Container.get(SmsService),
);
