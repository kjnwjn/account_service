const jsonResponse = require("../../utils/jsonResponse");
const { generateRandomString } = require("../../utils/helper");
const accountModel = require("../../model/account.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const accountValidate = require("../../services/validateSchema");
const { EXCHANGE_TYPE, EXCHANGE_NAME, QUEUE: queueName } = require("../../configs/variables");

// let queueName = require("../../configs/queue");
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
            let id_student = req.body.id_student;
            let password = req.body.password;
            let accountQuery = await accountModel.findOne({ id_student });
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
                                { data: "233213123" }
                            )
                            .then((data) => {
                                console.log(data);
                            });
                        res.end();
                        // let token = jwt.sign(
                        //     {
                        //         id_student: accountQuery.id_student,
                        //         fullName: accountQuery.fullName,
                        //         role: accountQuery.role,
                        //         status: accountQuery.status,
                        //     },
                        //     process.env.ACCESS_TOKEN_SECRET_KEY,
                        //     {
                        //         expiresIn: "1m",
                        //     }
                        // );
                        // let refreshToken = jwt.sign(
                        //     {
                        //         id_student: accountQuery.id_student,
                        //         fullName: accountQuery.fullName,
                        //         role: accountQuery.role,
                        //         status: accountQuery.status,
                        //     },
                        //     process.env.REFRESH_TOKEN_SECRET_KEY,
                        //     {
                        //         expiresIn: "30 days",
                        //     }
                        // );
                        // res.cookie("refreshToken", refreshToken);
                        // res.cookie("token", token);
                        // await accountModel.findOneAndUpdate(
                        //     { id_student },
                        //     { access_token: token, refresh_token: refreshToken, status: true }
                        // );

                        // return jsonResponse({ req, res }).status(200).json({
                        //     status: false,
                        //     message: "Login successfully!",
                        //     data: {
                        //         token,
                        //         refreshToken,
                        //     },
                        // });
                    } else {
                        return jsonResponse({ req, res }).status(401).json({
                            status: false,
                            message: "Invalid password!",
                        });
                    }
                });
            } else {
                return jsonResponse({ req, res }).status(401).json({
                    status: false,
                    message: "Account does not exist!",
                });
            }
        } catch (error) {
            return next(error);
        }
    },
};
