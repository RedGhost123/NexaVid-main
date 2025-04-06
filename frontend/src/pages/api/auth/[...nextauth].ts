import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import TwitterProvider from "next-auth/providers/twitter";
import axios from "axios";

export default NextAuth({
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email", required: true },
        password: { label: "Password", type: "password", required: true },
      },
      async authorize(credentials) {
        try {
          const res = await axios.post("http://localhost:5000/api/auth/login", {
            email: credentials.email,
            password: credentials.password,
          });

          if (res.status === 200) {
            return res.data.user;
          }
        } catch (error) {
          throw new Error("Invalid email or password");
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CONSUMER_KEY!,
      clientSecret: process.env.TWITTER_CONSUMER_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // ✅ Fix: Assign user ID
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string; // ✅ Fix: Ensure session.user.id exists
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/auth/login" }, // Custom login page
});
