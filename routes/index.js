const apiRoute = require("./api");
const swaggerFile = require("../utils/swagger_output.json");
const swaggerUi = require("swagger-ui-express");
module.exports = function route(app) {
    app.use("/api/account-service/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
    app.use("/api/account-service/v1", apiRoute);
};
