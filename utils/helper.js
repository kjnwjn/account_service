module.exports = {
    generateRandomString: (length) => {
        let result = "";
        let characters = "0123456789";
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },
    isTokenExpired: (token) => {
        const payloadBase64 = token.split(".")[1];
        const decodedJson = Buffer.from(payloadBase64, "base64").toString();
        const decoded = JSON.parse(decodedJson);
        const exp = decoded.exp;
        const expired = Date.now() >= exp * 1000;
        return expired;
    },
    isNull: (items) => {
        items.forEach((item) => {
            if (typeof item === "array") {
                if (item.length < 0) return { msg: `${item} must be provided`, checked: false };
            }
            if (!item) return { msg: `${item} must be provided`, checked: false };
        });
        return { checked: true };
    },
};
