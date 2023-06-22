import { PrismaAdapter } from "@next-auth/prisma-adapter";
import axios from "axios";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
  TokenSet,
} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { env } from "~/env.mjs";
import { IgmsHostResponse } from "~/models/igms/host.model";
import { prisma } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

const igmsDomain = "https://igms.com";
const igmsId = "igms";

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),

    {
      id: igmsId,
      name: "IGMS",
      type: "oauth",
      clientId: env.IGMS_CLIENT_ID,
      clientSecret: env.IGMS_CLIENT_SECRET,
      // checks: ["state"],

      // configure call to authorize user
      authorization: {
        params: {
          scope: "listings,direct-bookings,calendar-control,messaging,tasks",
          client_id: "229",
          redirect_uri: `http://localhost:3000/api/auth/callback/${igmsId}`,
        },
        url: `${igmsDomain}/app/auth.html`,
      },

      // make call to get token
      token: {
        async request(context) {
          const params = {
            grant_type: "authorization_code",
            code: context.params.code,
            redirect_uri: context.provider.callbackUrl,
            client_id: env.IGMS_CLIENT_ID,
            client_secret: env.IGMS_CLIENT_SECRET,
          };
          const response = await axios.get(`${igmsDomain}/auth/token`, {
            params,
          });
          return { tokens: response.data as TokenSet };
        },
      },

      // make call to get user info
      userinfo: {
        async request(context) {
          const url = `${igmsDomain}/api/v1/hosts`;
          const params = {
            access_token: context.tokens.access_token,
          };
          const response = await axios.get(url, { params });
          return response.data;
        },
      },

      // extract user info
      profile(response: IgmsHostResponse) {
        console.log("GOT PROFIlE", response);
        const user = response.data.find(
          (host) => host.platform_type === "airbnb"
        );
        if (!user) throw new Error("User not found");
        return {
          id: user.host_uid,
          name: user.name,
          email: user.email[0],
          image: user.thumbnail_url,
        };
      },
    },

    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
