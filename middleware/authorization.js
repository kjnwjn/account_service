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
                if (payload) {
                    const isCorrect = role.admin.filter((item) => {
                        return item === payload.role.toUpperCase();
                    });
                    if (isCorrect.length > 0) return next();
                }
                return jsonResponse({ req, res }).status(401).json({
                    message: "Permission denied! Only admin is allowed to access this enpoint!",
                });
            });
        } catch (error) {
            return next(error);
        }
    },
    managerGr: async (req, res, next) => {
        try {
            const token = req.query.token || req.headers["x-access-token"] || null;
            jwt.verify(token, process.env.SECRET_KEY, async (error, payload) => {
                if (error) {
                    return next(error);
                }
                if (payload) {
                    const isCorrect = role.managerGr.filter((item) => {
                        return item === payload.role.toUpperCase();
                    });
                    if (isCorrect.length > 0) return next();
                }
                return jsonResponse({ req, res }).status(401).json({
                    message: "Permission denied!",
                });
            });
        } catch (error) {
            return next(error);
        }
    },

    customerGr: async (req, res, next) => {
        try {
            const token = req.query.token || req.headers["x-access-token"] || null;
            jwt.verify(token, process.env.SECRET_KEY, async (error, payload) => {
                if (error) {
                    return next(error);
                }
                if (payload) {
                    const isCorrect = role.customerGr.filter((item) => {
                        return item === payload.role.toUpperCase();
                    });
                    if (isCorrect.length > 0) return next();
                }
                return jsonResponse({ req, res }).status(401).json({
                    message: "Permission denied!",
                });
            });
        } catch (error) {
            return next(error);
        }
    },
};

module.exports = authorization;
