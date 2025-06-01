import { NextResponse } from "next/server";
import { auth0 } from "../../../../lib/auth0";

export async function GET(request) {
  try {
    const session = await auth0.handleCallback(request);
    return NextResponse.redirect(new URL("/chat", process.env.AUTH0_BASE_URL));
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.redirect(new URL("/", process.env.AUTH0_BASE_URL));
  }
}
