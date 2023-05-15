import { prisma } from "~/server/plugins/prisma"

export default defineEventHandler(async (event) => {
    return await prisma.project.findMany({
        select: {
            name: true,
        }
    })
})