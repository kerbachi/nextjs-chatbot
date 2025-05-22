"use client";

import { useEffect, useState, useRef } from "react";
import { Message } from "../components/Message/route";
import { v4 as uuid } from "uuid";

export default function Chat() {
  const [ip, setIp] = useState("0.0.0.0");
  const [messageText, setMessageText] = useState("");
  const [incomingMessage, setIncomingMessage] = useState([]);
  const [userMessages, setUserMessages] = useState([]);
  const [assistantMessages, setAssistantMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    // Fetch the public IP address when the component mounts
    fetch("https://ifconfig.me/ip")
      .then((response) => response.text())
      .then((ip) => ip.trim())
      .then((ip) => setIp(ip))
      .catch((error) => console.error("Error fetching IP:", error));

    console.log("userMessages updated:", userMessages);
  }, [userMessages]); // Empty dependency array to run only once on mount

  useEffect(() => {
    // Scroll to bottom when messages update
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [incomingMessage, assistantMessages, userMessages]);

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setIsStreaming(true);
    const currentMessage = messageText;
    setMessageText("");

    // Add user message
    const userMessageId = uuid();
    setUserMessages((prev) => [
      ...prev,
      { _id: userMessageId, role: "user", content: currentMessage },
    ]);

    try {
      const response = await fetch(`/api/chat/sendMessage`, {
        headers: { "content-type": "application/json" },
        method: "POST",
        body: JSON.stringify({ message: currentMessage }),
      });

      if (!response.ok) throw new Error(response.statusText);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Clear any previous incoming message
      setIncomingMessage([]);

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Only add to assistantMessages if we have content
          if (incomingMessage.length > 0) {
            const completeMessage = incomingMessage.join("");
            setAssistantMessages((prev) => [
              ...prev,
              {
                _id: uuid(),
                role: "assistant",
                content: completeMessage,
              },
            ]);
          }
          break;
        }

        const chunk = decoder.decode(value);
        setIncomingMessage((prev) => [...prev, chunk]);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsStreaming(false);
      setIncomingMessage([]);
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
            <div
              className="flex flex-col gap-4 p-4 w-full"
              id="chat-window"
              ref={chatWindowRef}
            >
              {/* Interleave messages in chronological order */}
              {[...userMessages, ...assistantMessages]
                .sort((a, b) => a._id.localeCompare(b._id))
                .map((message) => (
                  <Message
                    key={message._id}
                    role={message.role}
                    content={message.content}
                  />
                ))}
              {/* Show streaming message at the end */}
              {isStreaming && incomingMessage.length > 0 && (
                <Message role="assistant" content={incomingMessage.join("")} />
              )}
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
