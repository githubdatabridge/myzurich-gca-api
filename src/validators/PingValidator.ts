import * as Joi from 'joi';

const pingSchema = Joi.object({
    ping: Joi.string().required(),
}).label('PingResponse');

export { pingSchema };
