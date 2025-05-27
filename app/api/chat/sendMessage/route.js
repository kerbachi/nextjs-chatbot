import { NextResponse } from "next/server";

// Set the runtime to edge for optimized performance
export const runtime = "edge";

const llm_provider_details = {
  OpenAI: {
    url: "https://api.openai.com/v1/chat/completions",
    model: "gpt-3.5-turbo",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
  },
  OpenRouter: {
    url: "https://openrouter.ai/api/v1/chat/completions",
    model: "microsoft/phi-4-reasoning-plus:free",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
  },
};

const llm_provider = "OpenRouter"; //"OpenAI";

console.log("llm_provider_details=", llm_provider_details[llm_provider]);

export async function POST(req) {
  const { message } = await req.json();

  let response;
  try {
    response = await fetch(llm_provider_details[llm_provider].url, {
      method: "POST",
      headers: llm_provider_details[llm_provider].headers,
      body: JSON.stringify({
        model: llm_provider_details[llm_provider].model,
        messages: [{ role: "user", content: message }],
        stream: true,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "OpenAI API error" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error fetching from OpenAI API:", error);
    return NextResponse.json({ error: "OpenAI API error" }, { status: 500 });
  }

  // Transform the response into a readable stream
  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // const chunk = decoder.decode(value);
          // const lines = chunk.split("\n");
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");

          // Keep the last line in buffer if it's incomplete
          buffer = lines.pop();

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                controller.close();
                return;
              }
              try {
                const json = JSON.parse(data);
                const text = json.choices[0]?.delta?.content || "";
                if (text) {
                  controller.enqueue(text);
                }
              } catch (e) {
                console.error("Error parsing JSON:", e);
              }
            }
          }
        }

        // Handle any remaining buffered line
        if (buffer && buffer.startsWith("data: ")) {
          const data = buffer.slice(6);
          if (data !== "[DONE]") {
            try {
              const json = JSON.parse(data);
              const text = json.choices[0]?.delta?.content || "";
              if (text) {
                controller.enqueue(text);
              }
            } catch (e) {
              // Ignore
            }
          }
        }
      } catch (error) {
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
