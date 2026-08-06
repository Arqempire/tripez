import { NextResponse } from "next/server";

// ─── Constants ────────────────────────────────────────────────────────────────

const SERPAPI_ENDPOINT = "https://serpapi.com/search.json";

// Timeout for upstream SerpApi requests (10 s)
const FETCH_TIMEOUT_MS = 10_000;

// Allowed values for whitelisted enum parameters
const ALLOWED_CURRENCIES = new Set(["INR", "USD", "EUR", "GBP", "AED", "SGD", "JPY", "AUD", "CAD", "SAR", "QAR"]);
const ALLOWED_TRAVEL_CLASS = new Set(["1", "2", "3", "4"]);   // 1=Economy … 4=First
const ALLOWED_TRIP_TYPE    = new Set(["1", "2"]);              // 1=Roundtrip, 2=One-way
const MAX_ADULTS = 9;

// ISO-8601 date — YYYY-MM-DD
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ─── City-name → IATA resolver ────────────────────────────────────────────────

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
  JOHANNESBURG: "JNB",
};

/**
 * Resolve a free-text airport query (city name or IATA code) to an IATA code.
 * Returns null when resolution is not possible so the caller can reject the request.
 */
function resolveIata(raw) {
  if (!raw || typeof raw !== "string") return null;
  const clean = raw.trim().toUpperCase().replace(/[^A-Z]/g, "");
  if (!clean) return null;
  if (clean.length === 3) return clean;                    // looks like an IATA already
  return CITY_TO_IATA[clean] ?? null;                     // city name lookup
}

/** Parse and clamp the adults count. Returns null when the value is unusable. */
function parseAdults(raw) {
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.min(n, MAX_ADULTS).toString();
}

/** Returns a date string defaulting to N days from now. */
function defaultDate(daysAhead) {
  return new Date(Date.now() + 86_400_000 * daysAhead).toISOString().split("T")[0];
}

// ─── Route handler ────────────────────────────────────────────────────────────

/**
 * GET /api/flights
 *
 * Query parameters:
 *   departure_id   – IATA code or city name (required)
 *   arrival_id     – IATA code or city name (required)
 *   outbound_date  – YYYY-MM-DD (optional, defaults to 7 days from now)
 *   return_date    – YYYY-MM-DD (optional, only used for roundtrip)
 *   type           – "1" roundtrip | "2" one-way (optional, defaults to "2")
 *   currency       – ISO currency code (optional, defaults to "INR")
 *   travel_class   – "1"–"4" (optional, defaults to "1" / Economy)
 *   adults         – 1–9 (optional, defaults to "1")
 */
export async function GET(request) {
  // ── 1. Read & validate query parameters ──────────────────────────────────

  const { searchParams } = new URL(request.url);

  const rawDep = searchParams.get("departure_id");
  const rawArr = searchParams.get("arrival_id");

  const departure_id = resolveIata(rawDep);
  const arrival_id   = resolveIata(rawArr);

  if (!departure_id) {
    return NextResponse.json(
      { error: "Missing or unrecognised departure_id. Provide an IATA code (e.g. DEL) or a city name." },
      { status: 400 }
    );
  }
  if (!arrival_id) {
    return NextResponse.json(
      { error: "Missing or unrecognised arrival_id. Provide an IATA code (e.g. BOM) or a city name." },
      { status: 400 }
    );
  }
  if (departure_id === arrival_id) {
    return NextResponse.json(
      { error: "departure_id and arrival_id must be different airports." },
      { status: 400 }
    );
  }

  // Dates
  const rawOutbound = searchParams.get("outbound_date");
  const outbound_date = rawOutbound && DATE_RE.test(rawOutbound)
    ? rawOutbound
    : defaultDate(7);

  const rawReturn = searchParams.get("return_date");
  const return_date = rawReturn && DATE_RE.test(rawReturn) ? rawReturn : "";

  // Trip type — infer from presence of return_date when not explicit
  const rawType = searchParams.get("type");
  const type = ALLOWED_TRIP_TYPE.has(rawType)
    ? rawType
    : return_date ? "1" : "2";

  // Currency
  const rawCurrency = (searchParams.get("currency") ?? "INR").toUpperCase();
  const currency = ALLOWED_CURRENCIES.has(rawCurrency) ? rawCurrency : "INR";

  // Travel class
  const rawClass = searchParams.get("travel_class");
  const travel_class = ALLOWED_TRAVEL_CLASS.has(rawClass) ? rawClass : "1";

  // Adults
  const adults = parseAdults(searchParams.get("adults")) ?? "1";

  // ── 2. Verify API key is available (server-side only) ────────────────────

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    // Do NOT expose which env var name is missing in production responses
    console.error("[flights] SERPAPI_KEY environment variable is not set.");
    return NextResponse.json(
      { error: "Flight search service is not configured. Please contact support." },
      { status: 503 }
    );
  }

  // ── 3. Build SerpApi URL (key appended last, never logged) ───────────────

  const serpUrl = new URL(SERPAPI_ENDPOINT);
  serpUrl.searchParams.set("engine",        "google_flights");
  serpUrl.searchParams.set("departure_id",  departure_id);
  serpUrl.searchParams.set("arrival_id",    arrival_id);
  serpUrl.searchParams.set("outbound_date", outbound_date);
  if (type === "1" && return_date) {
    serpUrl.searchParams.set("return_date", return_date);
  }
  serpUrl.searchParams.set("type",         type);
  serpUrl.searchParams.set("currency",     currency);
  serpUrl.searchParams.set("travel_class", travel_class);
  serpUrl.searchParams.set("adults",       adults);
  serpUrl.searchParams.set("hl",           "en");
  serpUrl.searchParams.set("api_key",      apiKey);   // appended last, never logged

  // Safe-to-log summary (no key, no PII)
  console.log(
    `[flights] ${departure_id}→${arrival_id} ${outbound_date}` +
    (type === "1" && return_date ? `→${return_date}` : "") +
    ` | type:${type} currency:${currency} class:${travel_class} adults:${adults}`
  );

  // ── 4. Fetch with timeout ─────────────────────────────────────────────────

  let res;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    res = await fetch(serpUrl.toString(), {
      cache:  "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch (err) {
    if (err.name === "AbortError") {
      console.error("[flights] SerpApi request timed out.");
      return NextResponse.json(
        { error: "Flight search timed out. Please try again." },
        { status: 504 }
      );
    }
    console.error("[flights] Network error reaching SerpApi:", err.message);
    return NextResponse.json(
      { error: "Could not reach the flight search service. Check your network connection." },
      { status: 502 }
    );
  }

  // ── 5. Handle upstream HTTP errors ───────────────────────────────────────

  if (!res.ok) {
    // Read body for internal logging only — do NOT forward raw upstream error to client
    const body = await res.text().catch(() => "");
    console.error(`[flights] SerpApi responded with HTTP ${res.status}:`, body.slice(0, 200));

    const clientMessage =
      res.status === 401 || res.status === 403
        ? "Flight search authentication failed. Please contact support."
        : res.status === 429
        ? "Too many flight search requests. Please wait a moment and try again."
        : `Flight search service returned an unexpected error (${res.status}). Please try again.`;

    return NextResponse.json({ error: clientMessage }, { status: res.status >= 500 ? 502 : res.status });
  }

  // ── 6. Parse and validate JSON body ──────────────────────────────────────

  let data;
  try {
    data = await res.json();
  } catch {
    console.error("[flights] SerpApi returned non-JSON response.");
    return NextResponse.json(
      { error: "Flight search returned an unreadable response. Please try again." },
      { status: 502 }
    );
  }

  if (data.error) {
    // SerpApi application-level error — log detail, return safe message
    console.error("[flights] SerpApi application error:", data.error);
    return NextResponse.json(
      { error: "Flight search returned an error. Please verify your route and dates.", search_metadata: data.search_metadata },
      { status: 400 }
    );
  }

  // ── 7. Return SerpApi payload as-is ──────────────────────────────────────
  // Structure: { best_flights, other_flights, airports, price_insights, search_metadata, … }
  return NextResponse.json(data);
}

// NOTE: Rate limiting / response caching is recommended before high-traffic launch.
// Options: Upstash Redis (edge-compatible), Vercel KV, or a simple in-memory LRU
// with a short TTL (e.g. 5 min) keyed on the sanitised search fingerprint.
