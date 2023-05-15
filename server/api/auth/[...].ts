import { NuxtAuthHandler } from "#auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "~/server/plugins/prisma";
import GithubProvider from "next-auth/providers/github";

const config = useRuntimeConfig();

export default NuxtAuthHandler({
  secret: config.secret,
  adapter: PrismaAdapter(prisma),
  providers: [
    // @ts-expect-error https://sidebase.io/nuxt-auth/getting-started/quick-start
    GithubProvider.default({
      clientId: config.github.clientId,
      clientSecret: config.github.clientSecret,
    }),
  ],
  callbacks: {
    session(params) {
      params.session.user.id = params.session.user.id;
      return params.session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  debug: true,
});
