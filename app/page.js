import Link from "next/link";
import { redirect } from "next/navigation";
import { auth0 } from "../lib/auth0";

export default async function Home() {
  const session = await auth0.getSession();

  if (session) {
    redirect("/chat");
  }

  return (
    <div>
      {/* <title> My ChatBot app </title> */}
      {/* <div className="grid h-screen grid-cols-[150px_1fr]">
        ChatHistory-
        <div className="flex flex-col overflow-hidden">
          <div className="flex flex-1 overflow-scroll">ChatWindow</div>
          <footer className="pt-20">
            <form>
              <fieldset>
                <textarea value={"Send your message"} />

                <input type="submit" value="Send" />
              </fieldset>
            </form>
            message_window
          </footer>
        </div>
      </div> */}

      <div className="flex items-center justify-center h-screen space-x-4">
        <Link href="/api/auth/login">login</Link>
        <Link href="/chat">signup</Link>
      </div>
    </div>
  );
}
