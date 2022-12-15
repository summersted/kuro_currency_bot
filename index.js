const TelegramAPI = require('node-telegram-bot-api');
const { BotCommands, CommandsLang } = require('./Config/Commands');
const { Config } = require('./Config/Config');
const { Languages } = require('./Config/Languages');
const { MenuOptions } = require('./Config/Options');
const { getCryptoPair } = require('./services');

const Bot = new TelegramAPI(process.env.token, { polling: true });

const STATES = {
    START: 'start',
    PAIRS: 'pairs',
    LISTEN: 'listen'
};

const userState = {};
var testInterval;

const TWTstate = {
    prev: 2.5,
    curr: null
};

const cryptoPairs = {};

const startBot = () => {
    Bot.setMyCommands(BotCommands);

    Bot.on('message', async (msg) => {
        const { text } = msg;
        const chatId = msg.chat.id;
        const userId = msg.chat.username;
        const { first_name, last_name } = msg.chat;

        if (text === CommandsLang.start) {
            userState[chatId] = STATES.START;

            return await Bot.sendMessage(chatId, Languages.hello);
        };

        // if (text === CommandsLang.info) {
        //     const user = await getUserWithUserId(userId);
        //     const isApproved = user[0]?.attributes?.is_approved;
        //     hasAdvancedAccess[chatId] = isApproved;
        //     const userinfo = Languages.infoAboutUser +
        //         `\n${Languages.identifier}: ${userId}` +
        //         `\n${Languages.name}: ${first_name} ${last_name ? last_name : ''}` +
        //         `\n${Languages.advancedAccess}: ${isApproved}`;

        //     return await Bot.sendMessage(
        //         chatId,
        //         userinfo
        //     );
        // };

        if (text === CommandsLang.menu) {
            return Bot.sendMessage(chatId, Languages.chooseAnOption, MenuOptions);
        };
        if (text === CommandsLang.stoplistener) {
            clearInterval(testInterval);
            return Bot.sendMessage(chatId, 'всі слухачі зупинено');
        };

        if (userState[chatId] === STATES.PAIRS && text.at(0) !== '/') {
            const answ = await getCryptoPair(text);
            userState[chatId] = STATES.START;
            const keys = Object.keys(answ);

            if (keys?.code == -1100) {
                return await Bot.sendMessage(chatId, Languages.notFound)
            }

            TWTstate.prev = answ.price;
            return await Bot.sendMessage(
                chatId,
                `${keys.map((key) => `\n${key}: ${answ[key]}`)}`
            );
        }

        if (userState[chatId] === STATES.LISTEN && text.at(0) !== '/') {


        }
    });

    Bot.on('callback_query', async (msg) => {
        const { data } = msg;
        const chatId = msg.message.chat.id;

        if (data === STATES.PAIRS) {
            userState[chatId] = STATES.PAIRS;
            return await Bot.sendMessage(chatId, Languages.parameterForSearch)
        }
        if (data === STATES.LISTEN) {
            userState[chatId] = STATES.LISTEN;
            await Bot.sendMessage(
                chatId,
                `Слухаю TWTUSDT...`
            );
            testInterval = setInterval(async () => {
                const answ = await getCryptoPair('TWTUSDT');
                TWTstate.curr = answ?.price;
                console.log(TWTstate);
                if (TWTstate.prev !== null) {
                    const diff = answ.price - TWTstate.prev;
                    if (Math.abs(diff) > TWTstate.prev * 0.01) {
                        TWTstate.prev = TWTstate.curr;
                        return await Bot.sendMessage(
                            chatId,
                            `${diff > 0 ? 'Виросло!' : 'Впало!'} -> ${answ.price}`
                        );
                    }
                    
                }
            }, Config.interval)
            // return await Bot.sendMessage(chatId, 'слухаю')
        }
    });
};

startBot();