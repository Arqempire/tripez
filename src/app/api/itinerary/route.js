import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { destination, days, travelers, interests, budget, style } = await request.json();

    const prompt = `Create a detailed ${days}-day personalized travel itinerary for ${destination}. Travelers: ${travelers}. Interests: ${interests}. Budget: ${budget}. Style: ${style}. Return a concise but useful plan with a title, a short overview, a day-by-day breakdown, and a list of must-know tips.`;

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          itinerary: {
            title: `${destination} Adventure`,
            overview: "AI itinerary generation is ready for configuration. Add an OpenAI API key to enable live itinerary generation.",
            days: [
              {
                day: 1,
                title: "Starter plan",
                plan: "Add your OpenAI API key to generate a personalized itinerary.",
              },
            ],
            tips: ["Set OPENAI_API_KEY in your environment to activate AI generation."],
          },
        },
        { status: 200 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "You are a travel planning assistant. Respond with valid JSON containing title, overview, days (array of objects with day, title, plan), and tips (array of strings).",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Unable to generate itinerary.");
    }

    const content = data.choices?.[0]?.message?.content || "{}";
    const cleaned = content.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        title: `${destination} Adventure`,
        overview: "A tailored itinerary is ready to review.",
        days: [{ day: 1, title: "Arrival and local highlights", plan: cleaned }],
        tips: ["Adjust the plan to fit your travel pace and interests."],
      };
    }

    return NextResponse.json({ itinerary: parsed });
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message || "Unable to generate itinerary right now.",
      },
      { status: 500 }
    );
  }
}
