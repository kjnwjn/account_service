const Router = require("express").Router();
// const authentication = require("../middleware/authentication");

const { login, refreshToken } = require("./modules/account");
// const { login, logout, newAccount, getAllAccount, refreshToken } = require("./modules/account");
// const { generateToken, getAccessToken } = require("./modules/test");
// const { newOrder, removeOrder, addToCart, payOrder } = require("./modules/order");
// const { newTable, getAllTable } = require("./modules/table");
// const { newCategory, removeCategory, updateCategory } = require("./modules/category");
// const { createNewDish, updateDishStatus } = require("./modules/dish");
// const { admin } = require("../middleware/authorization");
// const multerUpload = require("../utils/multer");

/**
 * Account ================================================================
 */

Router.post("/account/login", login);
// Router.get("/account/logout", authentication, logout);
Router.get("/account/refresh-token", refreshToken);

module.exports = Router;
