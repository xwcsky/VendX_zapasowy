const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const orders = await prisma.order.findMany();
    console.log(orders);
}

main()
    .then(() => prisma.$disconnect())
    .catch(e => console.error(e));