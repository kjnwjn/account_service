const accountModel = require("../../model/account.model");
const queueUtils = require("./queueUtils");
const { EXCHANGE_TYPE, EXCHANGE_NAME, QUEUE } = require("../../configs/variables");

const receiver = {
    init: function () {
        receiver.createClientData();
    },
    createClientData: async function () {
        queueUtils
            .consumeExchange(
                EXCHANGE_NAME.FAN_OUT_CREATE_CLIENT_DATA,
                EXCHANGE_TYPE.FANOUT,
                "",
                { durable: false },
                { noAck: true },
                async (msg) => {
                    if (msg) {
                        const isSucceed = new accountModel({
                            username: msg.data.id_student,
                            password: msg.data.password,
                        });
                        isSucceed.save(function (err, results) {
                            if (results) {
                                console.log("created successfully");
                            } else {
                                console.log(err);
                            }
                        });
                    }
                }
            )
            .catch((error) => {
                console.log(error);
            });
    },
    getAccountData: async function () {
        queueUtils
            .consumeExchange(
                EXCHANGE_NAME.FAN_OUT_GET_ACCOUNT_DATA,
                EXCHANGE_TYPE.FANOUT,
                "",
                { durable: false },
                { noAck: true },
                async (data) => {
                    console.log("🚀 ~ file: receive.js:11 ~ queueUtils.consumeExchange ~ data:", data);
                    if (data) {
                        if (student) {
                            return student;
                        } else {
                            console.log("student not found");
                        }
                    }
                }
            )
            .catch((error) => {
                console.log(error);
            });
    },
};
module.exports = receiver;
