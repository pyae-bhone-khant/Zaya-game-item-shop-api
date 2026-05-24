import { prisma } from "../lib/prisma";

export const getUserById = async (id: string) => {
   return await prisma.user.findUnique({
        where: {
            id: id
        }
    });
}

export const updateUser = async (userId: string, userData: any) => {
  return await prisma.user.update({
    where: {
    id: userId
    },
    data: userData
  });
}