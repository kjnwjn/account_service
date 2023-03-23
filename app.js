require("dotenv").config();
var { connect } = require("./configs/db");

var cors = require("cors");
var path = require("path");
var logger = require("morgan");
var express = require("express");
var createError = require("http-errors");
var cookieParser = require("cookie-parser");
var swaggerAutogen = require("swagger-autogen")();


const jsonResponse = require("./utils/jsonResponse");
var defineRoute = require("./routes/index");
const outputFile = "./utils/swagger_output.json";
const endpointsFiles = ["./routes/index.js"];
const corsOptions = { origin: "*", optionsSuccessStatus: 200 };

var app = express();
// connect();
app.use(cors(corsOptions));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// define api docs
const doc = {
    info: {
        title: "Customer order management module",
        description: "Description",
    },
    host: `localhost:${process.env.PORT}/api/security-service/v1`,
    schemes: ["http"],
};
swaggerAutogen(outputFile, endpointsFiles, doc);

defineRoute(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    return jsonResponse({ req, res })
        .status(err.status || 500)
        .json({ message: err.message || "Internal Server Error", errors: err });
});

module.exports = app;
