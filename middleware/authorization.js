const jwt = require("jsonwebtoken");
const role = require("../configs/role");
const admin = require("../configs/admin");
const jsonResponse = require("../utils/jsonResponse");
const authorization = {
    admin: async (req, res, next) => {
        try {
            const token = req.query.token || req.headers["x-access-token"] || req.cookies.token || null;

            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, async (error, payload) => {
                if (error) {
                    return next(error);
                }
                if (payload && payload.role.toUpperCase() == admin.userCode) {
                    return next();
                } else {
                    return jsonResponse({ req, res }).status(401).json({
                        message: "Permission denied! Only admin is allowed to access this enpoint!",
                    });
                }
            });
        } catch (error) {
            return next(error);
        }
    },
    otherAuthor: async (req, res, next) => {
        try {
            const token = req.query.token || req.headers["x-access-token"] || null;
            jwt.verify(token, process.env.SECRET_KEY, async (error, payload) => {
                if (error) {
                    return next(error);
                }
                if (payload) {
                    const valueRole = Object.values(role).shift();
                    const isCorrect = valueRole.filter((val) => {
                        if (payload.role.toUpperCase() == val) return true;
                    });
                    if (isCorrect) {
                        return next();
                    } else {
                        return jsonResponse({ req, res }).status(401).json({
                            message: "Permission denied! Only admin is allowed to access this enpoint!",
                        });
                    }
                }
            });
        } catch (error) {
            return next(error);
        }
    },
};

module.exports = authorization;
