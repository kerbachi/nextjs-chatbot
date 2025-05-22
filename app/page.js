import Link from "next/link";

export default function Home() {
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

      <div className="grid grid-cols-2">
        <Link href="/chat">login</Link>
        <Link href="/chat">signup</Link>
      </div>
    </div>
  );
}
