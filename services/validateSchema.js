const Joi = require("joi");

const accountValidate = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(3).max(30).required(),
    // access_token: [Joi.string(), Joi.number()],
    // refresh_token: [Joi.string(), Joi.number()],
});
module.exports = accountValidate;
