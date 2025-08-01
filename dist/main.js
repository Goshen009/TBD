import dayjs from 'dayjs';
import { config } from './config.js';
import { fetchDB, saveDB } from "./db.js";
const END_LINE = '========================================';
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
async function main() {
    const log = [];
    const msg = '*************************************************************************************';
    console.log(msg);
    log.push(msg);
    await sleep(180000); // Pause for 2 seconds
    const data = await fetchDB();
    if (!data) {
        console.log(END_LINE);
        log.push(END_LINE);
        console.log(msg);
        log.push(msg);
        return;
    }
    for (const form of data) {
        const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
        const msg = `===== [${now}] Sync for ${form.username} (${form.chat_id}) (${form.form_id}) =====`;
        console.log(msg);
        log.push(msg);
        console.log('');
        log.push('');
        const msg4 = `Previous last_id: ${form.last_id || '[none]'}`;
        console.log(msg4);
        log.push(msg4);
        console.log('');
        log.push('');
        const submissions = await fetchSubmissions(form, log);
        if (!submissions) { // there was an error. it has been logged in the function.
            console.log(END_LINE);
            log.push(END_LINE);
            console.log('');
            log.push('');
            console.log('');
            log.push('');
            continue;
        }
        if (submissions.length === 0) {
            const msg = '❕ No new submissions found.';
            console.log(msg);
            log.push(msg);
            console.log(END_LINE);
            log.push(END_LINE);
            console.log('');
            log.push('');
            console.log('');
            log.push('');
            continue;
        }
        const [vCards, details] = createVCards(submissions, log);
        const fileBlob = new Blob([Buffer.from(vCards, 'utf-8')], { type: 'text/vcard' });
        const form_data = new FormData();
        form_data.append('chat_id', form.chat_id);
        form_data.append('caption', `Your new contacts are ready!\n\n${details}`);
        form_data.append('document', fileBlob, 'contacts.vcf');
        const telegramResponse = await sendToTelegram(form_data, log);
        if (!telegramResponse) { // there was an error. it has been logged in the function.
            console.log(END_LINE);
            log.push(END_LINE);
            console.log('');
            log.push('');
            console.log('');
            log.push('');
            continue;
        }
        if (!telegramResponse.ok) { // the first one is for the StatusCode while this is Telegram returning a JSON telling us if the action was successful.
            const msg = `❌ Telegram API error (after returning 200 success): ${telegramResponse.description}`;
            console.error(msg);
            log.push(msg);
            console.log(END_LINE);
            log.push(END_LINE);
            console.log('');
            log.push('');
            console.log('');
            log.push('');
            continue;
        }
        const msg2 = `✅ Sent message successfully!`;
        console.log(msg2);
        log.push(msg2);
        const newId = submissions[0].id;
        form.last_id = newId;
        const msg3 = `Updated last_id to: ${newId}`;
        console.log(msg3);
        log.push(msg3);
        console.log(END_LINE);
        log.push(END_LINE);
        console.log('');
        log.push('');
        console.log('');
        log.push('');
    }
    const success = await saveDB(data);
    if (success) {
        const msg = '🔥💚 Another day wrapped up! Saved back to DB.';
        console.log(msg);
        log.push(msg);
    }
    else {
        const msg = '‼️‼️ Failed while saving to the database.';
        console.log(msg);
        log.push(msg);
    }
    console.log(msg);
    log.push(msg);
}
main();
function sanitize(str) {
    return str.replace(/[\x00-\x1F\x7F]/g, '').replace(/[;,]/g, match => '\\' + match).trim();
}
function createVCards(submissions, log) {
    let vCards = '';
    let details = 'Contact Summary\n';
    for (const sub of submissions) {
        const responses = sub.responses;
        const firstName = sanitize(responses[0].answer);
        const lastName = sanitize(responses[1].answer);
        const phone = responses[2].answer.trim();
        vCards +=
            `BEGIN:VCARD
VERSION:3.0
N:${lastName};${firstName};;;
FN:${firstName} ${lastName}
TEL;TYPE=CELL:${phone}
END:VCARD

`;
        const msg = `Added Contact: ${firstName} ${lastName} | ${phone}`;
        console.log(msg);
        log.push(msg);
        details += `• ${firstName} ${lastName} — ${phone}\n`;
    }
    console.log('');
    log.push('');
    return [vCards, details];
}
async function fetchSubmissions(form, log) {
    try {
        const query = form.last_id ? `?afterId=${form.last_id}` : '';
        const response = await fetch(`https://api.tally.so/forms/${form.form_id}/submissions${query}`, {
            headers: {
                Authorization: `Bearer ${config.tallyApiKey}`,
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            const msg = `❌ Tally API error: ${response.status}: ${await response.text()}`;
            console.error(msg);
            log.push(msg);
            return null;
        }
        const data = await response.json();
        return data.submissions;
    }
    catch (err) {
        const msg = `❌ Network error while fetching Tally Submissions: ${err.message}`;
        console.error(msg);
        log.push(msg);
        return null;
    }
}
async function sendToTelegram(form_data, log) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendDocument`, {
            method: 'POST',
            body: form_data,
        });
        if (!response.ok) {
            const msg = `❌ Telegram API error: ${response.status}: ${await response.text()}`;
            console.error(msg);
            log.push(msg);
            return null;
        }
        const data = await response.json();
        return data;
    }
    catch (err) {
        const msg = `❌ Network error while sending file to Telegram: ${err.message}`;
        console.error(msg);
        log.push(msg);
        return null;
    }
}
