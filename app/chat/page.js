"use client";

import { useEffect, useState } from "react";
import { Message } from "../components/Message/route";
import { v4 as uuid } from "uuid";

export default function Chat() {
  const [ip, setIp] = useState("0.0.0.0");
  const [messageText, setMessageText] = useState("");
  const [incomingMessage, setIncomingMessage] = useState([]);
  const [userMessages, setUserMessages] = useState([]);
  const [assistantMessages, setAssistantMessages] = useState([]);

  useEffect(() => {
    // Fetch the public IP address when the component mounts
    fetch("https://ifconfig.me/ip")
      .then((response) => response.text())
      .then((ip) => ip.trim())
      .then((ip) => setIp(ip))
      .catch((error) => console.error("Error fetching IP:", error));

    console.log("userMessages updated:", userMessages);
  }, [userMessages]); // Empty dependency array to run only once on mount

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents page reload
    console.log("messageText=", messageText);

    setUserMessages((prev) => [
      ...prev,
      { _id: uuid(), role: "user", content: messageText },
    ]);
    setMessageText(""); // Clear the message text

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
    let content = "";

    try {
      let chunks = [];
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          const completeMessage = chunks.join("");
          console.log("Stream complete, message:", completeMessage);

          if (completeMessage) {
            // Only add if there's content
            setAssistantMessages((prev) => {
              console.log("Previous AssistantMessages messages:", prev);
              const newMessages = [
                ...prev,
                {
                  _id: uuid(),
                  role: "assistant",
                  content: completeMessage,
                },
              ];
              console.log("New AssistantMessages messages:", newMessages);
              return newMessages;
            });
          }
          setIncomingMessage([]);
          break;
        }

        // Decode the stream chunk
        const chunk = decoder.decode(value);
        console.log("Received chunk:", chunk);

        // Accumulate chunks locally for correct message assembly
        chunks.push(chunk);

        // Update the UI with the new chunk
        setIncomingMessage((prev) => [...prev, chunk]);
      }
    } catch (error) {
      console.error("Error reading stream:", error);
    }
  };

  return (
    <div>
      <div className="grid h-screen grid-cols-[150px_1fr]">
        <div>
          <div>Chathistory</div>
          <div>{ip}</div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <div className="flex flex-1 overflow-scroll">
            <div className="flex flex-col gap-2 p-4" id="chat-window">
              {/* ChatWindow */}
              {/* {incomingMessage.map((chunk, index) => (
                <div key={index}>{chunk}</div>
              ))} */}
              {assistantMessages.map((message) => (
                <Message
                  key={message._id}
                  role={message.role}
                  content={message.content}
                />
              ))}
              {userMessages.map((message) => (
                <Message
                  key={message._id}
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
