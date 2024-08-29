import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client outside the function to avoid reinitialization on every request
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this is correctly set
});

const systemPrompt = "You are a customer support bot for HeadstarterAI...";

export async function POST(req) {
  const data = await req.json();
  const userMessage = data.content;

  try {
    const aiResponse = await getAIResponse(userMessage);

    return new NextResponse(JSON.stringify({ reply: aiResponse }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

async function getAIResponse(userInput) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Use a valid OpenAI model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userInput },
      ],
    });

    return (
      response.choices[0]?.message?.content ||
      "I'm sorry, I couldn't process that."
    );
  } catch (error) {
    console.error("Error while calling OpenAI API:", error);
    throw new Error("Error calling OpenAI API");
  }
}
