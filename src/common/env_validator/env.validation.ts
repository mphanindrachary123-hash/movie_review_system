import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
    DATABASE_URL: Joi.string().uri().required(),
    JWT_SECRET: Joi.string().min(6).required(),
    GOOGLE_CLIENT_ID: Joi.string().required(),
    GOOGLE_CLIENT_SECRET: Joi.string().required(),
    GOOGLE_CALLBACK_URL: Joi.string().uri().required(),
    PORT: Joi.number().default(3000),
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
});
