import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { destination, days, travelers, interests, budget, style } = await request.json();

    const prompt = `Create a detailed ${days}-day personalized travel itinerary for ${destination}. Travelers: ${travelers}. Interests: ${interests}. Budget: ${budget}. Style: ${style}. Return a concise but useful plan with a title, a short overview, a day-by-day breakdown, and a list of must-know tips.`;

    // 1. Change your env variable to look for Gemini's key
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          itinerary: {
            title: `${destination} Adventure`,
            overview: "AI itinerary generation is ready for configuration. Add a Gemini API key to enable live itinerary generation.",
            days: [
              {
                day: 1,
                title: "Starter plan",
                plan: "Add your Gemini API key to generate a personalized itinerary.",
              },
            ],
            tips: ["Set GEMINI_API_KEY in your environment to activate AI generation."],
          },
        },
        { status: 200 }
      );
    }

    // 2. Use the Gemini REST API endpoint (API key goes directly in the URL)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // 3. Gemini uses "systemInstruction" instead of a "system" role message
          systemInstruction: {
            parts: [
              {
                text: "You are a travel planning assistant. You MUST respond with valid JSON containing the following structure: { \"title\": \"string\", \"overview\": \"string\", \"days\": [ { \"day\": number, \"title\": \"string\", \"plan\": \"string\" } ], \"tips\": [ \"string\" ] }.",
              },
            ],
          },
          // 4. The main prompt goes in "contents"
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          // 5. Force JSON output
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    const data = await response.json();

    // Catch API-level errors
    if (!response.ok) {
      throw new Error(data.error?.message || "Unable to generate itinerary.");
    }

    // 6. Extract the text from Gemini's specific response structure
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
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