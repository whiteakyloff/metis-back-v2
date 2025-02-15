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
    }),
    register: z.object({
        email: z.string()
            .email(getLocalizationService().getTextById('INVALID_EMAIL_FORMAT')),
        username: z.string()
            .min(3, getLocalizationService().getTextById('INVALID_USERNAME_MIN_FORMAT'))
            .max(30, getLocalizationService().getTextById('INVALID_USERNAME_MAX_FORMAT'))
            .regex(/^[a-zA-Z0-9_-]+$/, getLocalizationService().getTextById('INVALID_USERNAME_FORMAT')),
        password: z.string()
            .min(8, getLocalizationService().getTextById('INVALID_PASSWORD_MIN_FORMAT'))
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, getLocalizationService().getTextById('INVALID_PASSWORD_FORMAT'))
    })
});

export const authSchema = createAuthSchema();