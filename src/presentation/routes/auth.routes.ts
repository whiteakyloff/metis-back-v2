import { Router } from "express";

import { AuthController } from "@presentation/controllers/auth.controller";
import { useExpressServer } from "routing-controllers";

const router = Router();

useExpressServer(router, {
    controllers: [AuthController],
    defaultErrorHandler: false,
    routePrefix: "",
    classTransformer: true, validation: true
});

export const authRoutes = router;