import * as Joi from 'joi';

const documentSchema = Joi.object({
    id: Joi.number().integer().min(1),
    fileName: Joi.string().required(),
    url: Joi.string().required(),
}).label('DocumentResult');

export { documentSchema };
