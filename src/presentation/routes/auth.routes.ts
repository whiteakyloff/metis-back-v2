import { Container } from "typedi";
import { NextFunction, Request, Response, Router } from "express";

import { AuthController } from "@presentation/controllers/auth.controller";
import { authSchema } from "@presentation/validators/auth.validator";
import { validate } from "@presentation/middlewares/validation.middleware";

const router = Router();

const getController = () => Container.get(AuthController);

router.post(
    '/register', validate(authSchema.login),
    (req: Request, res: Response, next: NextFunction) => {
        getController().register(req.body, res).catch(next)
    }
);

export const authRoutes = router;