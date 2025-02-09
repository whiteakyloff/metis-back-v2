import { z } from 'zod';

import { Container } from "typedi";
import { ILocalizationService } from "@domain/services/impl.localization.service";

const localizationService: ILocalizationService = Container.get('localizationService');

export const authSchema = {
    login : z.object({
        email: z.string()
            .email(localizationService.getTextById('INVALID_EMAIL_FORMAT')),
        password: z.string()
            .min(8, localizationService.getTextById('INVALID_PASSWORD_FORMAT'))
    })
}