const amqplib = require("amqplib");
const amqp_url_docker = "amqp://localhost";
const sendExchange = async (
    msg = {
        exchangeName: "",
        routingKey: "",
        queueName: "",
        exchangeType: "",
    }
) => {
    try {
        // create connection
        const connection = await amqplib.connect(amqp_url_docker);
        // create channel
        const channel = await connection.createChannel();
        // create queue

        const exchangeName = msg.exchangeName;
        await channel.assertExchange(exchangeName, msg.exchangeType, {
            durable: true,
        });
        await channel.publish(exchangeName, msg.routingKey, Buffer.from(JSON.stringify(msg)));
        console.log("send ok");
        setTimeout(() => {
            connection.close();
        }, 10000);
    } catch (e) {
        console.log(e.message);
    }
};
// const msg = process.argv.slice(2).join(' ') || 'hello';

// publistData({msg});

module.exports = { sendExchange };
