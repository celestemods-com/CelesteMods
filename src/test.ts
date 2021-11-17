import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()

import express from "express";
const app = express();
app.use(express.json());
const port = process.env.PORT || "3001";
app.listen(port, () => {
    console.log(`Server Running at ${port}`);
});

/*async function main() {
  // ... you will write your Prisma Client queries here
  await prisma.users.create({
    data: {
        displayName: 'Steve',
        discordID: 111,
        permissions: '',
    },
  })
  const allUsers = await prisma.users.findMany()
  console.log(allUsers)
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })*/

app.get('/users', async (_req: any, res: any) => {
    const user = await prisma.users.findMany();
    res.json(user);
});

app.post('/users', async (req: any, res: any) => {
    const user = await prisma.users.create({ data: req.body });
    res.json(user);
});