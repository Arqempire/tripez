import { NextResponse } from "next/server";

// City name to IATA code resolver
const CITY_TO_IATA = {
  DELHI: "DEL", NEWDELHI: "DEL",
  MUMBAI: "BOM", BOMBAY: "BOM",
  BANGALORE: "BLR", BENGALURU: "BLR",
  HYDERABAD: "HYD",
  KOLKATA: "CCU", CALCUTTA: "CCU",
  CHENNAI: "MAA", MADRAS: "MAA",
  GOA: "GOI",
  AHMEDABAD: "AMD",
  KOCHI: "COK", COCHIN: "COK",
  PUNE: "PNQ",
  JAIPUR: "JAI",
  LUCKNOW: "LKO",
  VARANASI: "VNS",
  SRINAGAR: "SXR",
  LEH: "IXL",
  GUWAHATI: "GAU",
  BHUBANESWAR: "BBI",
  NAGPUR: "NAG",
  INDORE: "IDR",
  LONDON: "LHR",
  PARIS: "CDG",
  DUBAI: "DXB",
  ABUDHABI: "AUH",
  DOHA: "DOH",
  RIYADH: "RUH",
  JEDDAH: "JED",
  MUSCAT: "MCT",
  KUWAIT: "KWI",
  BAHRAIN: "BAH",
  TOKYO: "HND",
  OSAKA: "KIX",
  SEOUL: "ICN",
  HONGKONG: "HKG",
  SINGAPORE: "SIN",
  KUALALUMPUR: "KUL",
  BANGKOK: "BKK",
  BALI: "DPS",
  JAKARTA: "CGK",
  SYDNEY: "SYD",
  MELBOURNE: "MEL",
  AUCKLAND: "AKL",
  NEWYORK: "JFK", NYC: "JFK",
  LOSANGELES: "LAX",
  SANFRANCISCO: "SFO",
  CHICAGO: "ORD",
  TORONTO: "YYZ",
  AMSTERDAM: "AMS",
  FRANKFURT: "FRA",
  MUNICH: "MUC",
  ZURICH: "ZRH",
  ISTANBUL: "IST",
  CAIRO: "CAI",
  JOHANNESBURG: "JNB"
};

function resolveIataCode(query) {
  if (!query) return "DEL";
  const clean = query.trim().toUpperCase().replace(/[^A-Z]/g, "");
  if (clean.length === 3) return clean;
  return CITY_TO_IATA[clean] || clean.substring(0, 3);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawDep = searchParams.get("departure_id") || "DEL";
  const rawArr = searchParams.get("arrival_id") || "BOM";
  const departure_id = resolveIataCode(rawDep);
  const arrival_id = resolveIataCode(rawArr);
  const outbound_date = searchParams.get("outbound_date") || new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0];
  const return_date = searchParams.get("return_date") || "";
  const currency = searchParams.get("currency") || "INR";
  const travel_class = searchParams.get("travel_class") || "1";
  const type = searchParams.get("type") || (return_date ? "1" : "2");
  const adults = searchParams.get("adults") || "1";

  const apiKey = process.env.SERPAPI_KEY || process.env.SERPAPI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "SERPAPI_KEY is not configured. Please add it to your .env.local file." },
      { status: 500 }
    );
  }

  try {
    const serpUrl = new URL("https://serpapi.com/search.json");
    serpUrl.searchParams.set("engine", "google_flights");
    serpUrl.searchParams.set("departure_id", departure_id);
    serpUrl.searchParams.set("arrival_id", arrival_id);
    serpUrl.searchParams.set("outbound_date", outbound_date);
    if (type === "1" && return_date) {
      serpUrl.searchParams.set("return_date", return_date);
    }
    serpUrl.searchParams.set("type", type);
    serpUrl.searchParams.set("currency", currency);
    serpUrl.searchParams.set("travel_class", travel_class);
    serpUrl.searchParams.set("adults", adults);
    serpUrl.searchParams.set("hl", "en");
    serpUrl.searchParams.set("api_key", apiKey);

    console.log(
      "[Flights API] Fetching from SerpApi:",
      `${departure_id} → ${arrival_id} on ${outbound_date}`,
      `| currency: ${currency} | class: ${travel_class} | type: ${type}`
    );

    const res = await fetch(serpUrl.toString(), { cache: "no-store" });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Flights API] SerpApi HTTP error:", res.status, errText);
      return NextResponse.json(
        { error: `SerpApi returned HTTP ${res.status}. Please check your API key and plan.` },
        { status: res.status }
      );
    }

    const data = await res.json();

    if (data.error) {
      console.error("[Flights API] SerpApi error response:", data.error);
      return NextResponse.json(
        { error: data.error, search_metadata: data.search_metadata },
        { status: 400 }
      );
    }

    // Return all SerpApi data as-is (best_flights, other_flights, airports, price_insights, etc.)
    return NextResponse.json(data);

  } catch (error) {
    console.error("[Flights API] Unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to connect to SerpApi. Please check your internet connection and try again." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const qs = new URLSearchParams({
      departure_id: body.departure_id || "DEL",
      arrival_id: body.arrival_id || "BOM",
      outbound_date: body.outbound_date || "",
      return_date: body.return_date || "",
      currency: body.currency || "INR",
      travel_class: body.travel_class || "1",
      type: body.type || "1",
      adults: body.adults || "1"
    });

    const mockRequest = { url: `http://localhost/api/flights?${qs.toString()}` };
    return GET(mockRequest);
  } catch (error) {
    return NextResponse.json({ error: "Invalid POST body" }, { status: 400 });
  }
}
