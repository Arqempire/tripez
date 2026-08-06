import { NextResponse } from "next/server";

const SERPAPI_ENDPOINT = "https://serpapi.com/search.json";
const FETCH_TIMEOUT_MS = 12_000;

/**
 * GET /api/flights/book
 *
 * Attempts to resolve a SerpApi booking_token into real airline / OTA URLs.
 * On any SerpApi error (expired token, plan restriction, etc.) it returns
 * { fallback: true } so the client can redirect to a working Google Flights
 * search instead of showing a dead-end error.
 *
 * Query parameters:
 *   booking_token    – the token from the flight result object
 *   departure_token  – for roundtrip outbound leg selection
 *   currency         – optional, defaults to "INR"
 *   departure_id     – used to build the fallback URL
 *   arrival_id       – used to build the fallback URL
 *   outbound_date    – used to build the fallback URL
 *   return_date      – used to build the fallback URL (roundtrip)
 *   type             – "1" roundtrip | "2" one-way
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const bookingToken   = searchParams.get("booking_token");
  const departureToken = searchParams.get("departure_token");
  const currency       = searchParams.get("currency") || "INR";

  // Fallback search URL params (always sent from client for graceful degradation)
  const departureId  = searchParams.get("departure_id")  || "";
  const arrivalId    = searchParams.get("arrival_id")    || "";
  const outboundDate = searchParams.get("outbound_date") || "";
  const returnDate   = searchParams.get("return_date")   || "";
  const type         = searchParams.get("type")          || "2";

  // Build fallback URL here on the server so client always has it
  const fallbackUrl = buildFallbackUrl({ departureId, arrivalId, outboundDate, returnDate, type });

  if (!bookingToken && !departureToken) {
    // No token — return fallback immediately, no SerpApi call needed
    return NextResponse.json({ fallback: true, fallback_url: fallbackUrl });
  }

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    console.error("[flights/book] SERPAPI_KEY is not set.");
    return NextResponse.json({ fallback: true, fallback_url: fallbackUrl });
  }

  // ── Build SerpApi booking request ─────────────────────────────────────────

  const serpUrl = new URL(SERPAPI_ENDPOINT);
  serpUrl.searchParams.set("engine",   "google_flights");
  serpUrl.searchParams.set("currency", currency);
  serpUrl.searchParams.set("hl",       "en");

  if (bookingToken) {
    serpUrl.searchParams.set("booking_token", bookingToken);
  } else {
    serpUrl.searchParams.set("departure_token", departureToken);
  }
  serpUrl.searchParams.set("api_key", apiKey); // appended last, never logged

  console.log(
    `[flights/book] Resolving ${bookingToken ? "booking_token" : "departure_token"} | ${departureId}→${arrivalId} ${outboundDate} | currency:${currency}`
  );

  // ── Fetch with timeout ────────────────────────────────────────────────────

  let res;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    res = await fetch(serpUrl.toString(), { cache: "no-store", signal: controller.signal });
    clearTimeout(timer);
  } catch (err) {
    if (err.name === "AbortError") {
      console.warn("[flights/book] SerpApi timed out — returning fallback.");
    } else {
      console.error("[flights/book] Network error:", err.message);
    }
    return NextResponse.json({ fallback: true, fallback_url: fallbackUrl });
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.warn(`[flights/book] SerpApi HTTP ${res.status} — returning fallback. Body: ${body.slice(0, 200)}`);
    return NextResponse.json({ fallback: true, fallback_url: fallbackUrl });
  }

  // ── Parse ─────────────────────────────────────────────────────────────────

  let data;
  try {
    data = await res.json();
  } catch {
    console.warn("[flights/book] Non-JSON SerpApi response — returning fallback.");
    return NextResponse.json({ fallback: true, fallback_url: fallbackUrl });
  }

  if (data.error) {
    // SerpApi application error (expired token, plan limit, invalid params, etc.)
    console.warn("[flights/book] SerpApi error:", data.error, "— returning fallback.");
    return NextResponse.json({ fallback: true, fallback_url: fallbackUrl });
  }

  // ── Normalise booking options ─────────────────────────────────────────────

  const rawOptions = data.booking_options ?? data.booking ?? [];

  const options = rawOptions.flatMap((opt) => {
    const results = [];

    if (opt.together?.url) {
      results.push({
        url:           opt.together.url,
        label:         opt.together.book_with || "Google Flights",
        marketed_as:   opt.marketed_as ?? [],
        price:         opt.price ?? null,
        book_directly: false,
      });
    }

    if (Array.isArray(opt.items)) {
      for (const item of opt.items) {
        if (item.url) {
          results.push({
            url:           item.url,
            label:         item.airline || item.book_with || "Airline",
            marketed_as:   opt.marketed_as ?? [],
            price:         opt.price ?? null,
            book_directly: item.book_with_airline ?? false,
          });
        }
      }
    }

    return results;
  });

  // If SerpApi returned no usable URLs, send the fallback
  if (options.length === 0) {
    console.log("[flights/book] No booking options in SerpApi response — returning fallback.");
    return NextResponse.json({ fallback: true, fallback_url: fallbackUrl });
  }

  return NextResponse.json({ booking_options: options });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildFallbackUrl({ departureId, arrivalId, outboundDate, returnDate, type }) {
  const isOneWay = type === "2";
  const q = isOneWay
    ? `One-way flights from ${departureId} to ${arrivalId} on ${outboundDate}`
    : `Flights from ${departureId} to ${arrivalId} on ${outboundDate}${returnDate ? ` returning ${returnDate}` : ""}`;
  return `https://www.google.com/travel/flights/search?${new URLSearchParams({ q })}`;
}
