module.exports = ({ res, req }) => {
    let statusCode = 200;
    return {
        status: function (newStatusCode) {
            if (typeof newStatusCode != "number") throw new Error("Status must be a number");
            res.status(newStatusCode);
            statusCode = newStatusCode;
            return {
                json: this.json,
            };
        },
        json({ status = false, message = "", data = null, errors = null }) {
            if (typeof message != "string") throw new Error("Message must be a string");
            if (typeof status != "boolean") throw new Error("Status must be a boolean");
            return res.json({
                status,
                statusCode,
                message,
                data,
                errors,
                requestURL: `${req.protocol}://${req.rawHeaders[1]}${req.originalUrl}`,
                timestamp: new Date().getTime(),
            });
        },
    };
};
