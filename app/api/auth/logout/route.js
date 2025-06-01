import { NextResponse } from "next/server";
import { auth0 } from "../../../../lib/auth0";

export async function GET() {
  try {
    const logoutUrl = await auth0.getLogoutUrl();
    return NextResponse.redirect(logoutUrl);
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.redirect(new URL('/', process.env.AUTH0_BASE_URL));
  }
}
