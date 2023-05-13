import { prisma } from "../../plugins/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const {
    name,
    color,
    description,
    client: { id: clientId },
    ticketStates,
    projectMembers,
  } = body;

  const project = await prisma.project.create({
    data: {
      name: name,
      description: description,
      clientId: clientId,
      color: color,
      members: {
        create: projectMembers,
      },
      ticketStates: {
        create: ticketStates,
      },
    },
  });
  return project;
});
