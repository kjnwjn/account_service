const jwt = require("jsonwebtoken");
const authentication = async function (req, res, next) {
    try {
        const token = req.query.token || req.headers["x-access-token"] || req.cookies.token;

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, async (error, payload) => {
            if (error) {
                return next(error);
            } else {
                return next();
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = authentication;
