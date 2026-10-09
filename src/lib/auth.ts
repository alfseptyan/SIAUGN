import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/server/shared/db"
import type { UserRole } from "@/lib/constants"

// Extend NextAuth types
declare module "next-auth" {
  interface User {
    role: UserRole
    nama: string
  }
  interface Session {
    user: {
      id: string
      email: string
      nama: string
      role: UserRole
      image?: string | null
    }
  }
}

declare module "next-auth" {
  interface JWT {
    id: string
    role: UserRole
    nama: string
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        const user = await db.user.findUnique({ where: { email } })
        if (!user || !user.isActive) {
          return null
        }

        const passwordCocok = await bcrypt.compare(password, user.password)
        if (!passwordCocok) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.nama,
          nama: user.nama,
          role: user.role,
          image: user.avatarUrl,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role
        token.nama = user.nama
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.nama = token.nama as string
      }
      return session
    },
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = request.nextUrl

      // Public routes
      const publicRoutes = ["/login", "/"]
      if (publicRoutes.includes(pathname)) {
        return true
      }

      // All other routes require authentication
      if (!isLoggedIn) {
        return false
      }

      return true
    },
  },
})
