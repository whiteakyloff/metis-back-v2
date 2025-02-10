import { z } from 'zod';
import { Container } from "typedi";
import { ILocalizationService } from "@domain/services/impl.localization.service";

const getLocalizationService = () => Container.get<ILocalizationService>('localizationService');

export const createAuthSchema = () => ({
    login: z.object({
        email: z.string()
            .email(getLocalizationService().getTextById('INVALID_EMAIL_FORMAT')),
        password: z.string()
            .min(8, getLocalizationService().getTextById('INVALID_PASSWORD_FORMAT'))
    })
});

export const authSchema = createAuthSchema();