import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient, User as PrismaUser } from "@prisma/client";
import { Awaitable } from "next-auth";
import { Adapter } from "next-auth/adapters";




type TrimmedUser = Omit<PrismaUser, "id">;
type CreateUser = (user: PrismaUser) => Awaitable<TrimmedUser>;

const getCreateUser = (prisma: PrismaClient): CreateUser => {
    return (user: PrismaUser): Awaitable<TrimmedUser> => {
        const { id, ...rest } = user;
        const trimmedUser = rest as TrimmedUser;


        return prisma.user.create({
            data: trimmedUser,
        });
    };
};




export const customPrismaAdapter = (prisma: PrismaClient): Adapter => {
    const createUser = getCreateUser(prisma);

    return {
        ...PrismaAdapter(prisma),
        //@ts-expect-error  //required because Adapter expects the AdapterUser declared in NextAuth core, but we're using our own     //TODO?: figure out if this can be done with module augmentation
        createUser, //overwrite the createUser function
    };
};