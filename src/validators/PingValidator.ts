import * as Joi from 'joi';

const pingSchema = Joi.object({
    ping: Joi.string().required(),
}).label('PingResult');

export { pingSchema };
