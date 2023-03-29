const jsonResponse = require("../../utils/jsonResponse");
const accountModel = require("../../model/account.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const accountValidate = require("../../services/validateSchema");
const { EXCHANGE_TYPE, EXCHANGE_NAME, QUEUE: queueName } = require("../../configs/variables");
let queueUtils = require("../../services/rabbitMq/queueUtils");

module.exports = {
    login: async (req, res, next) => {
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
                    if (isValid) {
                        queueUtils
                            .publishMessageToExchange(
                                EXCHANGE_NAME.DIRECT_GET_CLIENT_DATA,
                                EXCHANGE_TYPE.DIRECT,
                                queueName.getStudentData,
                                { durable: true },
                                { noAck: true },
                                {
                                    data: {
                                        id_student: username,
                                    },
                                }
                            )
                            .catch((error) => {
                                next(error);
                            });
                        let accountData;
                        queueUtils.consumeExchange(
                            EXCHANGE_NAME.FAN_OUT_GET_ACCOUNT_DATA,
                            EXCHANGE_TYPE.FANOUT,
                            "",
                            { durable: false },
                            { noAck: true },
                            async (msg) => {
                                if (msg) {
                                    if (msg) {
                                        accountData = msg.data;
                                        let token = jwt.sign(
                                            {
                                                username: accountData.id_student,
                                                fullName: accountData.fullName,
                                                role: accountData.role,
                                            },
                                            process.env.ACCESS_TOKEN_SECRET_KEY,
                                            {
                                                expiresIn: "1m",
                                            }
                                        );
                                        let refreshToken = jwt.sign(
                                            {
                                                username: accountData.id_student,
                                                fullName: accountData.fullName,
                                                role: accountData.role,
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
                                            { refresh_token: refreshToken, status: true }
                                        );

                                        return jsonResponse({ req, res }).status(200).json({
                                            status: true,
                                            message: "Login successfully!",
                                            data: {
                                                token,
                                                refreshToken,
                                            },
                                        });
                                    } else {
                                        console.log("student not found");
                                    }
                                }
                            }
                        );
                    } else {
                        return next(err);
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
};
