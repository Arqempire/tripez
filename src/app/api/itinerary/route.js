import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { destination, days, travelers, interests, budget, style } = await request.json();

    const cleanDestination = destination ? destination.split(",").map(s => s.trim()).filter(Boolean).join(", ") : "";

    const prompt = `Create a concise and meaningful ${days}-day travel itinerary for ${cleanDestination}. Travelers: ${travelers}. Interests: ${interests}. Budget: ${budget}. Style: ${style}. For each day's 'plan' string, you MUST output exactly three chronological activity slots: Morning, Afternoon, and Evening. Each slot must contain one key activity and a recommended local place to eat (Breakfast, Lunch, or Dinner). Use markdown bolding (**item**) for time slots, attractions, and restaurant recommendations.`;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          itinerary: {
            title: `${cleanDestination} Adventure`,
            overview: "A highly detailed sample travel plan is ready. Set your GEMINI_API_KEY in your environment to activate customized AI planning.",
            days: [
              {
                day: 1,
                title: "Arrival & Local Exploration",
                plan: "**Morning (08:00 AM - 12:00 PM)**: Check into your hotel, followed by **Breakfast** at **The Corner Bakery** for hot regional pastries.\n\n**Afternoon (12:00 PM - 05:00 PM)**: Walking tour of historic city center sights, followed by **Lunch** at **Bistro Garden** to savor signature local dishes.\n\n**Evening (05:00 PM - 10:00 PM)**: Evening museum visit, followed by **Dinner** at **Heritage Kitchen** for authentic regional gastronomy.",
              },
            ],
            tips: ["Set GEMINI_API_KEY in your environment to activate full AI generation."],
          },
        },
        { status: 200 }
      );
    }

    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          
          systemInstruction: {
            parts: [
              {
                text: "You are a professional travel planner. You MUST respond with valid JSON containing the structure: { \"title\": \"string\", \"overview\": \"string\", \"days\": [ { \"day\": number, \"title\": \"string\", \"plan\": \"string\" } ], \"tips\": [ \"string\" ] }.\n\nFor each day's 'plan' string, you MUST output exactly three chronological slots: Morning, Afternoon, and Evening. Each slot must contain one key activity and a specific recommended local restaurant matching the budget style (Breakfast for Morning, Lunch for Afternoon, Dinner for Evening).\n\nKeep descriptions brief, concise, and meaningful. Use markdown bolding (**item**) for time headers and restaurant names.\n\nExample of a single day's plan formatting to match exactly:\n\"**Morning (08:00 AM - 12:00 PM)**: Sightseeing at the city center, followed by **Breakfast** at **Stream Cafe** for traditional local pastries.\\n\\n**Afternoon (12:00 PM - 05:00 PM)**: Visit local waterfront gardens, followed by **Lunch** at **Mughal Kitchen** for signature specialties.\\n\\n**Evening (05:00 PM - 10:00 PM)**: Relaxing waterfront walk, followed by **Dinner** at **Lhasa Grill** to try authentic regional dishes.\"",
              },
            ],
          },
          
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    const data = await response.json();

    // Catching API-level errors
    if (!response.ok) {
      throw new Error(data.error?.message || "Unable to generate itinerary.");
    }

    //  Extracting the text from Gemini's specific response structure
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const cleaned = content.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        title: `${cleanDestination} Adventure`,
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