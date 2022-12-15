module.exports = {
    MenuOptions: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [
                    { text: 'Пари', callback_data: 'pairs' },
                    { text: 'Слухати', callback_data: 'listen' },
                ],
            ]
        })
    },
};