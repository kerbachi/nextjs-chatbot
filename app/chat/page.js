"use client";

import { useEffect, useState } from "react";
import { Message } from "../components/Message/route";
import { v4 as uuid } from "uuid";
import { useUser } from "@auth0/nextjs-auth0";
import Link from "next/link";

export default function Chat() {
  const [ip, setIp] = useState("0.0.0.0");
  const [messageText, setMessageText] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const { user, isLoading, error } = useUser();

  useEffect(() => {
    // Fetch the public IP address when the component mounts
    fetch("https://ifconfig.me/ip") //https://api.myip.com
      .then((response) => response.text())
      .then((ip) => ip.trim())
      .then((ip) => setIp(ip))
      .catch((error) => console.error("Error fetching IP:", error));
  }, []);
  //   console.log("userMessages updated:", userMessages);
  // }, [userMessages]); // Empty dependency array to run only once on mount

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents page reload
    console.log("messageText=", messageText);

    const userMessage = { _id: uuid(), role: "user", content: messageText };

    setAllMessages((prev) => [...prev, userMessage]);
    setMessageText(""); // Clear the message text

    // Create temporary assistant message for streaming response
    const assistantMessage = { _id: uuid(), role: "assistant", content: "" };
    setAllMessages((prev) => [...prev, assistantMessage]);

    //The userMessages state appears as an empty array when the submit action is triggered
    //because React state updates are asynchronous. When you call setUserMessages, the state does not update immediately. Instead, React schedules the update and re-renders the component later.\

    // console.log("userMessages=", userMessages);

    const response = await fetch(`/api/chat/sendMessage`, {
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ message: messageText }),
    });

    if (!response.ok) {
      console.error("Error:", response.statusText);
      return;
    }
    //https://mubin.io/streaming-real-time-openai-data-in-nextjs-a-practical-guide
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    // The receiveed chunk =
    // data: {"id":"chatcmpl-Bbny2fj9DPFJ9oGP3i5VZZsGux1vC",
    // "object":"chat.completion.chunk",
    // "created":1748349910,
    // "model":"gpt-3.5-turbo-0125",
    // "service_tier":"default",
    // "system_fingerprint":null,
    // "choices":[{"index":0,"delta":{"content":"?"},"logprobs":null,"finish_reason":null}]}
    // Can be undefined too

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log("Stream complete");
          reader.releaseLock();
          break;
        }

        // Decode the stream chunk
        const raw = decoder.decode(value);
        console.log("Received raw:", raw);
        const lines = raw
          .split("\n")
          .filter((line) => line.trim().startsWith("data:"));

        for (const line of lines) {
          const jsonStr = line.replace(/^data:\s*/, "").trim();

          // Handle "[DONE]" signal from OpenAI (if any)
          if (jsonStr === "[DONE]") {
            continue;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              setAllMessages((prev) => {
                if (prev.length === 0) return prev;
                const lastMessage = prev[prev.length - 1];
                if (lastMessage?.role === "assistant") {
                  const updatedMessage = {
                    ...lastMessage,
                    content: lastMessage.content + content,
                  };
                  return [...prev.slice(0, -1), updatedMessage];
                }
                return prev;
              });
            }
          } catch (err) {
            console.error("Failed to parse chunk:", jsonStr, err);
          }
        }
      } // While
    } catch (error) {
      console.error("Error reading stream:", error);
    }
  };

  return (
    <div>
      <div className="grid h-screen grid-cols-[150px_1fr]">
        <div>
          <Link href="/">Home</Link>
          <div>Chathistory</div>
          <div>{ip}</div>
          <div>{user ? user.name : "Guest"}</div>
          <div>
            {isLoading ? (
              "Loading..."
            ) : user ? (
              <Link href="/api/auth/logout">Logout</Link>
            ) : (
              <Link href="/api/auth/login">Login</Link>
            )}
          </div>
        </div>
        <div className="flex flex-1 flex-col overflow-hidden ">
          <div className="flex flex-1 overflow-auto">
            <div
              className="flex w-flex flex-col stretch gap-2 p-4"
              id="chat-window"
            >
              {allMessages.map((message) => (
                <Message
                  key={message._id} // Add unique key prop here
                  role={message.role}
                  content={message.content}
                />
              ))}
            </div>
          </div>
          <footer className="bg-gray-200 pt-10">
            <form onSubmit={handleSubmit}>
              <fieldset className="flex gap-2 items-center w-full">
                <textarea
                  className="flex-1 resize-none border-2 border-gray-300 rounded-md p-8"
                  value={messageText}
                  placeholder="Send your message ..."
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <input className="flex gap px-2" type="submit" value="Send" />
              </fieldset>
            </form>
          </footer>
        </div>
      </div>
    </div>
  );
}
