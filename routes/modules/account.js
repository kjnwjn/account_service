const jsonResponse = require("../../utils/jsonResponse");
const accountModel = require("../../model/account.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { accountValidate, changePassSchema } = require("../../services/validateSchema");
const axios = require("axios");

module.exports = {
    studentLogin: async (req, res, next) => {
        // #swagger.tags = ['Account']
        // #swagger.description = 'This endpoint provides method for logging in system. Then receive an access token.'

        try {
            const { error } = accountValidate.validate(req.body);
            if (error) {
                return jsonResponse({ req, res })
                    .status(error.status || 500)
                    .json({ message: error.details[0].message || "Internal Server Error" });
            }
            let username = req.body.username;
            let password = req.body.password;
            let accountQuery = await accountModel.findOne({ username });
            if (accountQuery) {
                bcrypt.compare(password, accountQuery.password, async (err, isValid) => {
                    if (err) return next(err);
                    if (isValid) {
                        axios
                            .get(`${process.env.ACCOUNT_SERVICE}/student/get/${username}`)
                            .then(async (accountRes) => {
                                if (accountRes.data.status) {
                                    let token = jwt.sign(
                                        {
                                            userCode: accountRes.data.data.id_student,
                                            fullName: accountRes.data.data.fullName,
                                            id_class: accountRes.data.data.id_class,
                                            id_faculty: accountRes.data.data.id_faculty,
                                            course_year: accountRes.data.data.course_year,
                                            role: "student",
                                        },
                                        process.env.ACCESS_TOKEN_SECRET_KEY,
                                        {
                                            expiresIn: "1 days",
                                        }
                                    );
                                    let refreshToken = jwt.sign(
                                        {
                                            userCode: accountRes.data.data.id_student,
                                            fullName: accountRes.data.data.fullName,
                                            id_class: accountRes.data.data.id_class,
                                            id_faculty: accountRes.data.data.id_faculty,
                                            course_year: accountRes.data.data.course_year,
                                            role: "student",
                                        },
                                        process.env.REFRESH_TOKEN_SECRET_KEY,
                                        {
                                            expiresIn: "30 days",
                                        }
                                    );
                                    res.cookie("refreshToken", refreshToken);
                                    res.cookie("token", token);
                                    await accountModel.findOneAndUpdate(
                                        { username },
                                        { access_token: token, refresh_token: refreshToken }
                                    );
                                    return jsonResponse({
                                        req,
                                        res,
                                    }).json({
                                        statusCode: true,
                                        message: "Login successfully!",
                                        data: {
                                            payload: {
                                                username: accountRes.data.data.id_student,
                                                fullName: accountRes.data.data.fullName,
                                                role: "student",
                                            },
                                            token,
                                            refreshToken,
                                        },
                                    });
                                }
                            })
                            .catch((err) => next(err));
                    } else {
                        return jsonResponse({ req, res }).status(401).json({
                            message: "Invalid password",
                        });
                    }
                });
            } else {
                return jsonResponse({ req, res }).status(401).json({
                    message: "Account does not exist!",
                });
            }
        } catch (error) {
            return next(error);
        }
    },

    userLogin: async (req, res, next) => {
        // #swagger.tags = ['Account']
        // #swagger.description = 'This endpoint provides method for logging in system. Then receive an access token.'

        try {
            const { error } = accountValidate.validate(req.body);
            if (error) {
                return jsonResponse({ req, res })
                    .status(error.status || 500)
                    .json({ message: error.details[0].message || "Internal Server Error" });
            }
            let username = req.body.username;
            let password = req.body.password;
            let accountQuery = await accountModel.findOne({ username });
            if (accountQuery) {
                bcrypt.compare(password, accountQuery.password, async (err, isValid) => {
                    if (err) return next(err);
                    if (isValid) {
                        axios
                            .get(`${process.env.ACCOUNT_SERVICE}/user/get/${username}`)
                            .then(async (accountRes) => {
                                if (accountRes.data.status) {
                                    let token = jwt.sign(
                                        {
                                            userCode: accountRes.data.data.id_user,
                                            fullName: accountRes.data.data.fullName,
                                            id_faculty: accountRes.data.data.id_faculty,
                                            role: accountRes.data.data.role,
                                        },
                                        process.env.ACCESS_TOKEN_SECRET_KEY,
                                        {
                                            expiresIn: "1 days",
                                        }
                                    );
                                    let refreshToken = jwt.sign(
                                        {
                                            userCode: accountRes.data.data.id_user,
                                            fullName: accountRes.data.data.fullName,
                                            id_faculty: accountRes.data.data.id_faculty,
                                            role: accountRes.data.data.role,
                                        },
                                        process.env.REFRESH_TOKEN_SECRET_KEY,
                                        {
                                            expiresIn: "30 days",
                                        }
                                    );
                                    res.cookie("refreshToken", refreshToken);
                                    res.cookie("token", token);
                                    await accountModel.findOneAndUpdate(
                                        { username },
                                        { access_token: token, refresh_token: refreshToken }
                                    );
                                    return jsonResponse({
                                        req,
                                        res,
                                    }).json({
                                        statusCode: true,
                                        message: "Login successfully!",
                                        data: {
                                            payload: {
                                                username: accountRes.data.data.id_user,
                                                fullName: accountRes.data.data.fullName,
                                                role: "student",
                                            },
                                            token,
                                            refreshToken,
                                        },
                                    });
                                }
                            })
                            .catch((err) => next(err));
                    } else {
                        return jsonResponse({ req, res }).status(401).json({
                            message: "Invalid password",
                        });
                    }
                });
            } else {
                return jsonResponse({ req, res }).status(401).json({
                    message: "Account does not exist!",
                });
            }
        } catch (error) {
            return next(error);
        }
    },
    refreshToken: async function (req, res, next) {
        // #swagger.tags = ['Account']
        const refreshToken = req.cookies.refreshToken || null;
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY, async (e, refreshPayload) => {
            if (e) {
                return next(e);
            } else {
                let newToken = jwt.sign(
                    {
                        username: refreshPayload.username,
                        fullName: refreshPayload.fullName,
                        role: refreshPayload.role,
                    },
                    process.env.ACCESS_TOKEN_SECRET_KEY,
                    {
                        expiresIn: "1h",
                    }
                );
                res.cookie("token", newToken);
                return jsonResponse({ req, res })
                    .status(200)
                    .json({
                        status: true,
                        message: "token updated successfully.",
                        data: {
                            token: newToken,
                        },
                    });
            }
        });
    },
    createNewAccount: async (req, res, next) => {
        // #swagger.tags = ['Account']
        // #swagger.description = 'This endpoint provides method for logging in system. Then receive an access token.'
        try {
            const { error } = accountValidate.validate(req.body);
            if (error) {
                return jsonResponse({ req, res })
                    .status(error.status || 500)
                    .json({ message: error.details[0].message || "Internal Server Error" });
            }
            const purePassword = req.body.password;
            const hashPassword = bcrypt.hashSync(purePassword, bcrypt.genSaltSync(10));
            const accountQuery = new accountModel({
                username: req.body.username,
                password: hashPassword,
                role: req.body.role,
            });
            await accountQuery.save();

            if (accountQuery)
                return jsonResponse({ req, res }).json({
                    status: true,
                    message: "Create new account successfully",
                    data: { username: req.body.username, password: purePassword },
                });
        } catch (err) {
            next(err);
        }
    },
    updatePassword: async (req, res, next) => {
        /*
            #swagger.tags = ['Account']
        */
        try {
            const { error } = changePassSchema.validate(req.body);
            if (error) {
                return jsonResponse({ req, res })
                    .status(error.status || 500)
                    .json({ message: error.details[0].message || "Internal Server Error" });
            }
            const { username, oldPassword, newPassword } = req.body;
            const accountQuery = await accountModel.findOne({ username });

            if (!accountQuery) {
                return jsonResponse({ req, res }).json({
                    message: `Username is not exist!`,
                });
            }
            const isCorrect = await bcrypt.compare(oldPassword, accountQuery.password);
            if (!isCorrect) {
                return jsonResponse({ req, res }).json({
                    message: `Password is incorrect!`,
                });
            }
            const hashNewPassword = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
            accountQuery.password = hashNewPassword;
            await accountQuery.save();
            return jsonResponse({ req, res }).json({
                status: true,
                message: `Change password successfully`,
                data: accountQuery,
            });
        } catch (err) {
            return next(err);
        }
    },
    getAllAccounts: async (req, res, next) => {
        try {
            const accountQuery = await accountModel.find({});
            if (accountQuery) {
                return jsonResponse({ req, res }).json({
                    status: true,
                    message: `Get all accounts successfully`,
                    data: {
                        students: accountQuery.filter((account) => account.role == "STUDENT"),
                        user: accountQuery.filter((account) => account.role != "STUDENT"),
                    },
                });
            }
        } catch (err) {
            return next(err);
        }
    },
};
