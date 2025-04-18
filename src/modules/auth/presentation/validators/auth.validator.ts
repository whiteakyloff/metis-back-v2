import { z } from 'zod';
import { Container } from "typedi";

import { ILocalizationService } from "@shared/domain/services/impl.localization.service";

const getLocalizationService = () =>
    Container.get<ILocalizationService>('localizationService');

export const authSchema = {
    login: z.object({
        email: z.string({
            message: getLocalizationService().getTextById('EMAIL_REQUIRED')
        })
            .email(getLocalizationService().getTextById('INVALID_EMAIL_FORMAT')),
        password: z.string({
            message: getLocalizationService().getTextById('PASSWORD_REQUIRED')
        })
            .min(8, getLocalizationService().getTextById('INVALID_PASSWORD_FORMAT'))
    }),
    register: z.object({
        email: z.string(
            { message: getLocalizationService().getTextById('EMAIL_REQUIRED') }
        )
            .email(getLocalizationService().getTextById('INVALID_EMAIL_FORMAT')),
        username: z.string(
            { message: getLocalizationService().getTextById('USERNAME_REQUIRED') }
        )
            .nonempty(getLocalizationService().getTextById('USERNAME_REQUIRED'))
            .min(3, getLocalizationService().getTextById('INVALID_USERNAME_MIN_FORMAT'))
            .max(30, getLocalizationService().getTextById('INVALID_USERNAME_MAX_FORMAT')),
        password: z.string(
            { message: getLocalizationService().getTextById('PASSWORD_REQUIRED') }
        )
            .nonempty(getLocalizationService().getTextById('PASSWORD_REQUIRED'))
            .min(8, getLocalizationService().getTextById('INVALID_PASSWORD_MIN_FORMAT'))
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+\-=[\]{}|;:'",.<>/?]{8,}$/, getLocalizationService().getTextById('INVALID_PASSWORD_FORMAT'))
    }),
    sendVerificationEmail: z.object({
        email: z.string(
            { message: getLocalizationService().getTextById('EMAIL_REQUIRED') }
        )
            .email(getLocalizationService().getTextById('INVALID_EMAIL_FORMAT')),
        verificationType: z.enum(['REGISTER', 'RECOVERY'], {
            message: getLocalizationService().getTextById('INVALID_VERIFICATION_TYPE')
        })
    }),
    verifyEmail: z.object({
        verificationCode: z.string(
            { message: getLocalizationService().getTextById('CODE_REQUIRED') }
        )
            .length(6, getLocalizationService().getTextById('INVALID_CODE_FORMAT')),
        email: z.string(
            { message: getLocalizationService().getTextById('EMAIL_REQUIRED') }
        )
            .email(getLocalizationService().getTextById('INVALID_EMAIL_FORMAT')),
        verificationType: z.enum(['REGISTER', 'RECOVERY'], {
            message: getLocalizationService().getTextById('INVALID_VERIFICATION_TYPE')
        })
    }),
    recovery: z.object({
        email: z.string(
            { message: getLocalizationService().getTextById('EMAIL_REQUIRED') }
        )
            .email(getLocalizationService().getTextById('INVALID_EMAIL_FORMAT')),
        password: z.string(
            { message: getLocalizationService().getTextById('PASSWORD_REQUIRED') }
        )
            .nonempty(getLocalizationService().getTextById('PASSWORD_REQUIRED'))
            .min(8, getLocalizationService().getTextById('INVALID_PASSWORD_MIN_FORMAT'))
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+\-=[\]{}|;:'",.<>/?]{8,}$/, getLocalizationService().getTextById('INVALID_PASSWORD_FORMAT'))
    })
} as const;