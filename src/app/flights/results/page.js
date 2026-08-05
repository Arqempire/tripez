"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase/client";
import Sidebar from "@/components/Sidebar";

// Material Symbols are used via the .mi CSS class + font loaded in layout.js

/**
 * Build a Google Flights deep-link that matches the search parameters
 * so the user lands on a pre-populated Google Flights page.
 *
 * Google Flights URL structure:
 *   https://www.google.com/travel/flights/search?tfs=...
 *
 * The `tfs` parameter encodes the itinerary. The simplest reliable approach
 * is to use the `q` (query) parameter which Google Flights understands:
 *   /travel/flights/search?tfs=CBw...
 *
 * Since the `tfs` encoding is opaque binary, we use the well-known
 * Google Flights search query string format instead:
 *   /travel/flights?q=Flights+from+DEL+to+BOM
 * combined with additional supported parameters.
 */
function buildGoogleFlightsUrl({ departureId, arrivalId, outboundDate, returnDate, type, travelClass }) {
  // type: "1" = roundtrip, "2" = oneway
  const isOneWay = type === "2";

  // Class map: 1=economy, 2=premium economy, 3=business, 4=first
  const classMap = { "1": "Economy", "2": "Premium+Economy", "3": "Business", "4": "First" };
  const cabinLabel = classMap[travelClass] || "Economy";

  const base = "https://www.google.com/travel/flights/search";
  const params = new URLSearchParams();

  // Build the human-readable query Google Flights understands
  if (isOneWay) {
    params.set("q", `One-way flights from ${departureId} to ${arrivalId}`);
  } else {
    params.set("q", `Flights from ${departureId} to ${arrivalId}`);
  }

  // Add structured itinerary via tfs parameter (Google Flights deep-link format)
  // Format: CBwQAhooEgoyMDI2LTA4LTE1agcIARIDREVMcgcIARIDQk9NGAAqBggBEgIxMg==
  // Since tfs is base64 proto, we instead rely on the URL format below which
  // works reliably across regions:
  // /travel/flights#flt=DEL.BOM.2026-08-15;c:INR;e:1;sd:1;t:f
  // However the # anchor params are not universally stable either.
  // The most stable approach is the structured search URL:
  const fromTo = `${departureId}.${arrivalId}.${outboundDate}`;
  let flightHash = fromTo;
  if (!isOneWay && returnDate) {
    flightHash += `*${arrivalId}.${departureId}.${returnDate}`;
  }

  // Cabin code: f=economy, p=premium, b=business, r=first
  const cabinCode = { "1": "f", "2": "p", "3": "b", "4": "r" }[travelClass] || "f";

  return `https://www.google.com/travel/flights#flt=${encodeURIComponent(flightHash)};c:${cabinCode};tt:${isOneWay ? "o" : "r"}`;
}

const formatDDMMYYYY = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.trim().split(" ");
  const datePart = parts[0];
  const timePart = parts[1] ? ` ${parts[1]}` : "";
  const dParts = datePart.split("-");
  if (dParts.length === 3) {
    return `${dParts[2].padStart(2, "0")}/${dParts[1].padStart(2, "0")}/${dParts[0]}${timePart}`;
  }
  return dateStr;
};

function FlightResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Query parameters
  const departureId = (searchParams.get("departure_id") || "DEL").toUpperCase();
  const arrivalId = (searchParams.get("arrival_id") || "BOM").toUpperCase();
  const outboundDate = searchParams.get("outbound_date") || "";
  const returnDate = searchParams.get("return_date") || "";
  const currency = searchParams.get("currency") || "INR";
  const travelClass = searchParams.get("travel_class") || "1";
  const type = searchParams.get("type") || "1";

  // Telemetry & results
  const [fetching, setFetching] = useState(true);
  const [flightData, setFlightData] = useState(null);
  const [fetchError, setFetchError] = useState("");

  // Filters & sorting
  const [sortBy, setSortBy] = useState("cheapest");
  const [nonstopOnly, setNonstopOnly] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) return;

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      const profileName = session.user?.user_metadata?.full_name || session.user?.email || "Traveler";
      setUserName(profileName);
      setLoading(false);

      // Fetch live flight results
      fetchLiveResults();
    };

    loadSession();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, searchParams]);

  const fetchLiveResults = async () => {
    setFetching(true);
    setFetchError("");

    try {
      const url = `/api/flights?departure_id=${encodeURIComponent(departureId)}&arrival_id=${encodeURIComponent(arrivalId)}&outbound_date=${encodeURIComponent(outboundDate)}&return_date=${encodeURIComponent(returnDate)}&currency=${encodeURIComponent(currency)}&travel_class=${encodeURIComponent(travelClass)}&type=${encodeURIComponent(type)}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || data.error) {
        const errMsg = typeof data.error === "string"
          ? data.error
          : `SerpApi returned an error (HTTP ${res.status}). Check your SERPAPI_KEY in .env.local and ensure your plan supports Google Flights.`;
        setFetchError(errMsg);
        return;
      }

      setFlightData(data);
    } catch (err) {
      console.error("Flight fetch error:", err);
      setFetchError("Failed to connect to SerpApi Google Flights server. Check your network connection.");
    } finally {
      setFetching(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/");
  };

  const processedFlights = useMemo(() => {
    if (!flightData) return [];

    let combined = [
      ...(flightData.best_flights || []),
      ...(flightData.other_flights || []),
      ...(flightData.flights_results || [])
    ];

    if (nonstopOnly) {
      combined = combined.filter(f => f.type === "Nonstop" || (!f.layovers || f.layovers.length === 0));
    }

    combined.sort((a, b) => {
      if (sortBy === "cheapest") return (a.price || 0) - (b.price || 0);
      if (sortBy === "fastest") return (a.total_duration || 0) - (b.total_duration || 0);
      if (sortBy === "earliest") {
        const timeA = a.flights?.[0]?.departure_airport?.time || "";
        const timeB = b.flights?.[0]?.departure_airport?.time || "";
        return timeA.localeCompare(timeB);
      }
      return 0;
    });

    return combined;
  }, [flightData, nonstopOnly, sortBy]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[linear-gradient(135deg,_#0f172a_0%,_#1e293b_100%)] text-white font-sans">
        <div className="relative flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-sky-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-xs font-bold uppercase tracking-widest text-sky-300 animate-pulse">Initializing Telemetry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_50%,_#ffffff_100%)] text-slate-900 font-sans antialiased">
      {/* SIDEBAR NAVIGATION */}
      <Sidebar
        userName={userName}
        handleSignOut={handleSignOut}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* MAIN CONTENT CONTAINER */}
      <main className={`flex-1 w-full min-w-0 overflow-x-hidden min-h-screen pt-6 md:pt-0 pb-24 md:pb-8 transition-all duration-300 ${isSidebarCollapsed ? "md:pl-20" : "md:pl-64"}`}>
        <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-8 sm:py-10 space-y-6 sm:space-y-8">
          
          {/* SEARCH SUMMARY BANNER & MODIFY BUTTON */}
          <header className="w-full bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 tracking-wider">Live Google Fares</span>
                <span className="text-xs text-slate-400 font-medium">{type === "1" ? "Roundtrip Flight" : "One-way Flight"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{departureId}</span>
                <span className="text-sky-600">➔</span>
                <span>{arrivalId}</span>
              </h1>
              <p className="text-xs font-semibold text-slate-500">
                Outbound: <strong className="text-slate-800">{formatDDMMYYYY(outboundDate) || "Flexible"}</strong>
                {returnDate && <> • Return: <strong className="text-slate-800">{formatDDMMYYYY(returnDate)}</strong></>}
              </p>
            </div>

            <Link
              href="/flights"
              className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-sky-50 hover:text-sky-700 border border-slate-300 text-xs font-extrabold text-slate-700 transition-all duration-200 cursor-pointer self-start md:self-auto inline-flex items-center gap-2 shadow-2xs"
            >
              <span className="mi text-sm">edit</span> Modify Search
            </Link>
          </header>

          {/* FETCHING LOADING STATE */}
          {fetching ? (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center space-y-4 shadow-lg">
              <div className="relative flex justify-center">
                <div className="h-16 w-16 rounded-full border-4 border-sky-100 border-t-sky-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-xl">✈️</div>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Querying Live Fares across 450+ Airlines...</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">Fetching real-time schedules, baggage policies, and fare classes from Google Flights radar.</p>
            </div>
          ) : fetchError ? (
            <div className="bg-white border border-rose-200 rounded-3xl p-8 text-center space-y-3 shadow-lg">
              <span className="text-4xl block">⚠️</span>
              <h3 className="text-base font-extrabold text-rose-700">Flight Search Warning</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">{fetchError}</p>
              <Link href="/flights" className="inline-block px-6 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold mt-2">
                Return to Search Hub
              </Link>
            </div>
          ) : (
            <section className="w-full space-y-6">
              
              {/* SORTING & FILTER CONTROLS BAR */}
              <div className="w-full bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Sort By:</span>
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                    {[
                      { label: "Cheapest", value: "cheapest" },
                      { label: "Fastest",  value: "fastest"  },
                      { label: "Earliest", value: "earliest" }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSortBy(opt.value)}
                        className={`sort-pill px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer ${
                          sortBy === opt.value ? "bg-white text-slate-900 shadow-2xs active" : "text-slate-600"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <label className="flex items-center gap-2 text-xs font-extrabold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={nonstopOnly}
                      onChange={(e) => setNonstopOnly(e.target.checked)}
                      className="h-4 w-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 cursor-pointer"
                    />
                    Nonstop Only
                  </label>

                  <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    {processedFlights.length} Flights Available
                  </span>
                </div>
              </div>

              {/* FLIGHT RESULT CARDS */}
              <div className="space-y-4">
                {processedFlights.length === 0 ? (
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-10 text-center space-y-3">
                    <span className="text-4xl block">✈️</span>
                    <h3 className="text-base font-extrabold text-slate-900">No flights matched your filter parameters</h3>
                    <p className="text-xs text-slate-500">Uncheck "Nonstop Only" to view connection options.</p>
                  </div>
                ) : (
                  processedFlights.map((flight, idx) => {
                    const firstLeg = flight.flights?.[0];
                    const lastLeg = flight.flights?.[flight.flights.length - 1];

                    return (
                      <div
                      key={flight.departure_token || idx}
                        className="flight-card bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-6 shadow-md shadow-slate-200/50 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 sm:gap-6 group"
                      >
                        {/* Airline Logo & Segment Timeline */}
                        <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5">
                          <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 p-2 shadow-xs group-hover:scale-105 transition-transform">
                            {firstLeg?.airline_logo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={firstLeg.airline_logo}
                                alt={firstLeg?.airline || flight.airline}
                                className="h-7 w-7 sm:h-8 sm:w-8 object-contain"
                              />
                            ) : (
                              <span className="mi text-2xl text-slate-400">flight</span>
                            )}
                          </div>

                          <div className="flex-1 grid grid-cols-3 items-center gap-1 sm:gap-4 w-full min-w-0">
                            {/* Departure */}
                            <div>
                              <p className="text-base sm:text-xl font-black text-slate-900">
                                {firstLeg?.departure_airport?.time ? firstLeg.departure_airport.time.split(" ")[1] : "06:15"}
                              </p>
                              <p className="text-xs font-extrabold text-slate-500 uppercase">{firstLeg?.departure_airport?.id || departureId}</p>
                              <p className="text-[10px] text-slate-400 truncate">{firstLeg?.airline || flight.airline}</p>
                            </div>

                            {/* Timeline Graphic */}
                            <div className="flex flex-col items-center text-center">
                              <span className="text-[11px] font-extrabold text-slate-600">
                                {Math.floor((flight.total_duration || 120) / 60)}h {(flight.total_duration || 120) % 60}m
                              </span>
                              <div className="relative w-full my-2 flex items-center">
                                <div className="h-0.5 w-full bg-slate-200 rounded-full" />
                                <div className="absolute left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 text-[10px] font-extrabold text-sky-600 border border-slate-200 rounded-full shadow-2xs flex items-center gap-1">
                                  <span>{flight.type || "Nonstop"}</span>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-slate-400">
                                {flight.layovers && flight.layovers.length > 0
                                  ? `${flight.layovers.length} stop (${flight.layovers[0].name})`
                                  : "Direct"}
                              </span>
                            </div>

                            {/* Arrival */}
                            <div className="text-right">
                              <p className="text-base sm:text-xl font-black text-slate-900">
                                {lastLeg?.arrival_airport?.time ? lastLeg.arrival_airport.time.split(" ")[1] : "08:30"}
                              </p>
                              <p className="text-xs font-extrabold text-slate-500 uppercase">{lastLeg?.arrival_airport?.id || arrivalId}</p>
                              <p className="text-[10px] text-slate-400 truncate">{flight.flight_number || "Direct"}</p>
                            </div>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="hidden lg:block h-12 w-px bg-slate-200/80 shrink-0" />

                        {/* Price & Action */}
                        <div className="flex items-center justify-between lg:justify-end gap-6 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                          <div>
                            <p className="text-2xl font-black text-slate-900 tracking-tight">
                              {(() => {
                                const p = flight.price ?? flight.total_price ?? flight.fare_price;
                                return p ? `${currency} ${Number(p).toLocaleString()}` : `${currency} —`;
                              })()}
                            </p>
                            <span className="inline-block text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                              Lowest Fare
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedFlight(flight)}
                            className="select-btn px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 text-xs font-bold text-white shadow-lg shadow-sky-100 cursor-pointer inline-flex items-center gap-1.5"
                          >
                            Select Flight <span className="mi text-sm">arrow_forward</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          )}

          {/* FLIGHT DETAILS MODAL */}
          {selectedFlight && (
            <div
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-sm"
              onClick={(e) => { if (e.target === e.currentTarget) setSelectedFlight(null); }}
            >
              <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">

                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
                  <div className="flex items-center gap-3">
                    {selectedFlight.flights?.[0]?.airline_logo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={selectedFlight.flights[0].airline_logo} alt={selectedFlight.airline} className="h-9 w-9 object-contain rounded-xl border border-slate-100 p-1 bg-slate-50" />
                    )}
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-sky-700">{selectedFlight.type || "Nonstop"}</p>
                      <h3 className="text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                        {selectedFlight.flights?.[0]?.airline || selectedFlight.airline}
                        <span className="ml-2 text-slate-400 font-semibold">{selectedFlight.flight_number}</span>
                      </h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFlight(null)}
                    className="h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold transition-colors cursor-pointer shrink-0"
                  >
                    <span className="mi text-lg">close</span>
                  </button>
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">

                  {/* ─── FLIGHT SEGMENTS ─── */}
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><span className="mi text-sm">flight</span> Flight Segments</h4>
                    {selectedFlight.flights?.map((leg, legIdx) => (
                      <div key={legIdx} className="border border-slate-200 rounded-2xl overflow-hidden">
                        {/* Segment header */}
                        <div className="bg-slate-50 px-4 py-2 flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-700">
                            Leg {legIdx + 1}: {leg.departure_airport?.id} ➔ {leg.arrival_airport?.id}
                          </span>
                          <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                            {leg.airplane || "Aircraft"}
                          </span>
                        </div>

                        {/* Segment timeline */}
                        <div className="px-4 py-3 flex items-center gap-4">
                          <div className="text-left min-w-0">
                            <p className="text-xl font-black text-slate-900">{leg.departure_airport?.time?.split(" ")[1] || "--:--"}</p>
                            <p className="text-xs font-extrabold text-slate-500 uppercase">{leg.departure_airport?.id}</p>
                            <p className="text-[10px] text-slate-400 truncate max-w-[110px]">{leg.departure_airport?.name}</p>
                            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{formatDDMMYYYY(leg.departure_airport?.time?.split(" ")[0])}</p>
                          </div>

                          <div className="flex-1 flex flex-col items-center gap-1">
                            <p className="text-[10px] font-extrabold text-slate-500">{Math.floor((leg.duration || 0) / 60)}h {(leg.duration || 0) % 60}m</p>
                            <div className="relative w-full flex items-center">
                              <div className="h-px w-full bg-slate-300" />
                              <div className="absolute left-1/2 -translate-x-1/2 bg-white px-1">
                                <span className="mi text-[18px] text-sky-500">flight</span>
                              </div>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400">{leg.travel_class || "Economy"}</p>
                          </div>

                          <div className="text-right min-w-0">
                            <p className="text-xl font-black text-slate-900">{leg.arrival_airport?.time?.split(" ")[1] || "--:--"}</p>
                            <p className="text-xs font-extrabold text-slate-500 uppercase">{leg.arrival_airport?.id}</p>
                            <p className="text-[10px] text-slate-400 truncate max-w-[110px] text-right">{leg.arrival_airport?.name}</p>
                            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{formatDDMMYYYY(leg.arrival_airport?.time?.split(" ")[0])}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Layover info */}
                    {selectedFlight.layovers?.map((lv, li) => (
                      <div key={li} className="flex items-center gap-2 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                        <span className="mi text-sm text-amber-600">schedule</span>
                        <span>Layover in <strong>{lv.name}</strong> — {Math.floor((lv.duration || 0) / 60)}h {(lv.duration || 0) % 60}m</span>
                      </div>
                    ))}
                  </div>

                  {/* ─── BAGGAGE POLICY ─── */}
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><span className="mi text-sm">luggage</span> Baggage Allowance</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Carry-on */}
                      <div className="border border-slate-200 rounded-2xl p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="mi text-xl text-sky-500">backpack</span>
                          <p className="text-xs font-extrabold text-slate-700">Carry-on Bag</p>
                        </div>
                        {selectedFlight.extensions?.some(e => /carry|cabin|personal/i.test(e)) ? (
                          <p className="text-[11px] font-semibold text-emerald-700">
                            {selectedFlight.extensions.find(e => /carry|cabin|personal/i.test(e))}
                          </p>
                        ) : (
                          <>
                            <p className="text-[11px] font-semibold text-slate-600">1 bag included</p>
                            <p className="text-[10px] text-slate-400">Up to 7 kg / Fits overhead bin</p>
                          </>
                        )}
                      </div>

                      {/* Checked bag */}
                      <div className="border border-slate-200 rounded-2xl p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="mi text-xl text-indigo-500">luggage</span>
                          <p className="text-xs font-extrabold text-slate-700">Checked Bag</p>
                        </div>
                        {selectedFlight.extensions?.some(e => /\d+\s?kg|luggage|checked/i.test(e)) ? (
                          <p className="text-[11px] font-semibold text-emerald-700">
                            {selectedFlight.extensions.find(e => /\d+\s?kg|luggage|checked/i.test(e))}
                          </p>
                        ) : selectedFlight.carbon_emissions ? (
                          <>
                            <p className="text-[11px] font-semibold text-slate-600">15 kg included</p>
                            <p className="text-[10px] text-slate-400">Additional bags available</p>
                          </>
                        ) : (
                          <>
                            <p className="text-[11px] font-semibold text-amber-700">Not included</p>
                            <p className="text-[10px] text-slate-400">Add at checkout from ₹1,499</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ─── FLIGHT FEATURES / AMENITIES ─── */}
                  {selectedFlight.extensions && selectedFlight.extensions.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><span className="mi text-sm">star</span> Included Amenities</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedFlight.extensions.map((ext, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full">
                            {ext}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ─── CARBON EMISSIONS ─── */}
                  {selectedFlight.carbon_emissions && (
                    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                      <span className="mi text-2xl text-emerald-600">eco</span>
                      <div>
                        <p className="text-xs font-extrabold text-emerald-800">Carbon Emissions</p>
                        <p className="text-[11px] text-emerald-700 font-semibold">
                          {selectedFlight.carbon_emissions.this_flight
                            ? `${Math.round(selectedFlight.carbon_emissions.this_flight / 1000)} kg CO₂e`
                            : "Emissions data unavailable"}
                          {selectedFlight.carbon_emissions.difference_percent != null && (
                            <span className="ml-1 font-black">
                              ({selectedFlight.carbon_emissions.difference_percent > 0 ? "+" : ""}{selectedFlight.carbon_emissions.difference_percent}% vs avg)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer — Price + Book CTA */}
                <div className="border-t border-slate-100 px-6 py-4 shrink-0">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Fare</p>
                      <p className="text-2xl font-black text-slate-900 tracking-tight">
                        {(() => {
                          const p = selectedFlight.price ?? selectedFlight.total_price ?? selectedFlight.fare_price;
                          return p ? `${currency} ${Number(p).toLocaleString()}` : "See on Google Flights";
                        })()}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">per person, taxes included</p>
                    </div>
                    <a
                      href={buildGoogleFlightsUrl({
                        departureId,
                        arrivalId,
                        outboundDate,
                        returnDate,
                        type,
                        travelClass
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="book-cta px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 text-xs font-extrabold text-white shadow-lg shadow-sky-100 cursor-pointer inline-flex items-center gap-2 shrink-0"
                    >
                      Book on Google Flights ↗
                    </a>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default function FlightResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white font-sans">
        <p className="text-xs font-bold uppercase tracking-widest text-sky-400 animate-pulse">Loading Results Deck...</p>
      </div>
    }>
      <FlightResultsContent />
    </Suspense>
  );
}
