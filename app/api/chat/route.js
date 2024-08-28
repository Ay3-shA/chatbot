import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = "You are a customer support bot for HeadstarterAI...";

// Initialize OpenAI client outside the function to avoid reinitialization on every request
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this is correctly set
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req) {
  const data = await req.json();
  const userMessage = data.content;

  try {
    const aiResponse = await getAIResponse(userMessage);

    return new NextResponse(JSON.stringify({ reply: aiResponse }), {
      status: 200,
    });

  }catch (error) {
    console.error("Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

async function getAIResponse(userInput) {
  const response = await openai.chat.completions.create({
    model: "meta-llama/llama-3.1-8b-instruct:free",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userInput },
    ],
  });

  return (
    response.choices[0]?.message?.content ||
    "I'm sorry, I couldn't process that."
  );
}
