const { Client } = require('pg');
const passwords = ['postgres', 'postgres123', 'admin', 'admin123', '123', '123456', 'root', '@123', 'postgres@123'];

async function brute() {
    for (const pw of passwords) {
        const url = `postgresql://postgres:${encodeURIComponent(pw)}@127.0.0.1:5432/postgres`;
        console.log(`Testing password: "${pw}"`);
        const client = new Client({ connectionString: url });
        try {
            await client.connect();
            console.log(`✅ Success! Correct password is: "${pw}"`);
            await client.end();
            return;
        } catch (err) {
            console.log(`❌ Failed: ${err.message}`);
        }
    }
}

brute();
