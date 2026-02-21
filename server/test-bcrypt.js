const bcrypt = require('bcryptjs');

async function test() {
    try {
        const password = 'password123';
        const invalidHash = 'EWDtSe';
        console.log('Testing bcrypt.compare with invalid hash...');
        const result = await bcrypt.compare(password, invalidHash);
        console.log('Result:', result);
    } catch (err) {
        console.error('Caught error:', err);
    }
}

test();
