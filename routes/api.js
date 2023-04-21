const Router = require("express").Router();

const { userLogin, refreshToken, studentLogin, createNewAccount, updatePassword } = require("./modules/account");

/**
 * Account ================================================================
 */

Router.post("/user-login", userLogin);
Router.post("/student-login", studentLogin);
Router.post("/new-account", createNewAccount);
Router.post("/change-pass", updatePassword);
Router.get("/refresh-token", refreshToken);

module.exports = Router;
