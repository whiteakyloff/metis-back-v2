import {Service} from "typedi";
import {Get, JsonController, Res} from "routing-controllers";
import {Response} from "express";

@Service()
@JsonController("/app")
export class AppController {

    @Get("/health")
    async health(@Res() res: Response) {
        return res.status(200).json({ success: true, message: 'status: OK' });
    }
}
