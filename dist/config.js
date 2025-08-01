import dotenv from 'dotenv';
dotenv.config();
export const config = {
    token: process.env.TOKEN,
    binId: process.env.BIN_ID,
    gistId: process.env.GIST_ID,
    tallyApiKey: process.env.TALLY_API_KEY,
    jsonApiKey: process.env.JSON_BIN_IO_API_KEY,
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
};
