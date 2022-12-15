const { Config } = require("./Config/Config");

const axios = require("axios");
const { AddressModel } = require("./Config/models");
// Strapi API
axios.default.defaults.baseURL = Config.HOME_API;
axios.default.defaults.headers.common['Content-Type'] = 'application/json';



module.exports = {
    getCryptoPair: async (pair) => {
        try {
            const data = await axios.default.get(`ticker/price?symbol=${pair}`)
                .then((res) => {
                    return res.data;
                });
            return data;
        } catch (error) {
            console.log(error.response.data);
        }
    }
}
    // ? filters[$or][0][address][$containsi] = miss
    // & filters[$or][1][address][$containsi]=oregon