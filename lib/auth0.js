import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Initialize the Auth0 client
export const auth0 = new Auth0Client({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  baseURL: process.env.AUTH0_BASE_URL || "http://localhost:3000",
  secret: process.env.AUTH0_SECRET,

  routes: {
    callback: "/api/auth/callback",
    login: "/api/auth/login",
    logout: "/api/auth/logout",
  },

  authorizationParams: {
    response_type: "code",
    scope: "openid profile email",
    audience: process.env.AUTH0_AUDIENCE,
    redirect_uri: `${process.env.AUTH0_BASE_URL}/api/auth/callback`,
  },

  session: {
    absoluteDuration: 24 * 60 * 60, // 24 hours
    cookie: {
      domain: "localhost",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  },
});
