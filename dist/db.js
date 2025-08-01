import { config } from './config.js';
export async function fetchDB() {
    try {
        const res = await fetch(`https://api.github.com/gists/${config.gistId}`);
        const gist = await res.json();
        return JSON.parse(gist.files['formsDB.json'].content);
    }
    catch (err) {
        const msg = `❌ Network error while fetching from the db: ${err.message}`;
        console.error(msg);
        return null;
    }
}
export async function saveDB(data) {
    try {
        const res = await fetch(`https://api.github.com/gists/${config.gistId}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${config.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: {
                    ['formsDB.json']: {
                        content: JSON.stringify(data, null, 2)
                    }
                }
            })
        });
        return res.ok;
    }
    catch (err) {
        const msg = `❌ Network error while saving to the db: ${err.message}`;
        console.error(msg);
        return false;
    }
}
// async function fetchDB() {
//    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`);
//    const gist = await res.json();
//    return JSON.parse(gist.files[FILENAME].content);
// }
// export async function fetchDB(): Promise<FormInterface[]> {
//    const response = await fetch(`https://api.jsonbin.io/v3/b/${config.binId}/latest`, {
//       method: 'GET',
//       headers: {
//          'X-Master-Key': config.jsonApiKey!,
//          'X-Bin-Meta': 'false',
//          'Content-Type': 'application/json',
//       }
//    });
//    if (!response.ok) {
//       throw new Error(`Failed to fetch bin: ${response.statusText}`);
//    }
//    const json: FormInterface[] = await response.json();
//    return json;
// }
// export async function saveDB(data: FormInterface[]) {
//    const response = await fetch(`https://api.jsonbin.io/v3/b/${config.binId}`, {
//       method: 'PUT',
//       headers: {
//          'X-Master-Key': config.jsonApiKey!,
//          'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(data)
//    });
//    if (!response.ok) {
//       throw new Error(`Failed to update bin: ${response.statusText}`);
//    }
// }
