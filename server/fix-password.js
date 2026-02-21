const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const email = 'aakshna122005@gmail.com';
    const newPassword = 'password123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    console.log(`Updating password for ${email}...`);

    const user = await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
    });

    console.log('✅ Password updated successfully!');
    console.log('User status:', JSON.stringify({
        id: user.id,
        email: user.email,
        onboarded: user.onboarded
    }, null, 2));
}

main()
    .catch((e) => {
        console.error('❌ Error updating password:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
