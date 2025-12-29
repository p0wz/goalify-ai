const database = require('../backend/lib/database');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

async function makeAdmin(email) {
    try {
        console.log(`Searching for user: ${email}...`);
        const user = await database.getUserByEmail(email);
        if (!user) {
            console.error('User not found!');
            process.exit(1);
        }

        console.log(`User found: ${user.id} (${user.role})`);
        console.log('Updating role to admin...');

        const client = database.getClient();
        await client.execute({
            sql: 'UPDATE users SET role = ? WHERE id = ?',
            args: ['admin', user.id]
        });

        console.log('Success! User is now an admin.');
    } catch (error) {
        console.error('Error:', error);
    }
}

const email = process.argv[2];
if (!email) {
    console.log('Usage: node make_admin.js <email>');
    process.exit(1);
}

makeAdmin(email);
