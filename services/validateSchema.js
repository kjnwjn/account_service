const Joi = require("joi");

const accountValidate = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(3).max(30).required(),
    role: Joi.string().min(3).max(30).required(),
});
const changePassSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    oldPassword: Joi.string().min(3).max(30).required(),
    newPassword: Joi.string().min(3).max(30).required(),
});
module.exports = { accountValidate, changePassSchema };
