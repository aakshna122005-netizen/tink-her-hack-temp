const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function check() {
    const url = process.env.DATABASE_URL;
    console.log('Testing URL:', url);
    const client = new Client({ connectionString: url });
    try {
        await client.connect();
        console.log('✅ Connection successful!');
        await client.end();
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        if (err.message.includes('database "pitchbridge" does not exist')) {
            console.log('Attempting to create database...');
            const rootUrl = url.replace(/\/pitchbridge$/, '/postgres');
            const rootClient = new Client({ connectionString: rootUrl });
            try {
                await rootClient.connect();
                await rootClient.query('CREATE DATABASE pitchbridge');
                console.log('✅ Database created!');
                await rootClient.end();
            } catch (createErr) {
                console.error('❌ Could not create database:', createErr.message);
            }
        }
    }
}

check();
