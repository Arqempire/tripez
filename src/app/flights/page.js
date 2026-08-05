"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import Sidebar from "@/components/Sidebar";
import { MASTER_AIRPORTS, searchMasterAirports } from "@/lib/airports";

// Material Symbols are used via the .mi CSS class + font loaded in layout.js

const POPULAR_AIRPORTS = [
  { code: "DEL", city: "Delhi", country: "India", name: "Indira Gandhi Intl Airport" },
  { code: "BOM", city: "Mumbai", country: "India", name: "Chhatrapati Shivaji Maharaj Intl" },
  { code: "BLR", city: "Bengaluru", country: "India", name: "Kempegowda Intl Airport" },
  { code: "HYD", city: "Hyderabad", country: "India", name: "Rajiv Gandhi Intl Airport" },
  { code: "CCU", city: "Kolkata", country: "India", name: "Netaji Subhash Chandra Bose Intl" },
  { code: "MAA", city: "Chennai", country: "India", name: "Chennai Intl Airport" },
  { code: "GOI", city: "Goa", country: "India", name: "Dabolim / Manohar Intl" },
  { code: "AMD", city: "Ahmedabad", country: "India", name: "Sardar Vallabhbhai Patel Intl" },
  { code: "COK", city: "Kochi", country: "India", name: "Cochin Intl Airport" },
  { code: "PNQ", city: "Pune", country: "India", name: "Pune Airport" },
  { code: "JFK", city: "New York", country: "USA", name: "John F. Kennedy Intl" },
  { code: "LAX", city: "Los Angeles", country: "USA", name: "Los Angeles Intl" },
  { code: "SFO", city: "San Francisco", country: "USA", name: "San Francisco Intl" },
  { code: "LHR", city: "London", country: "UK", name: "Heathrow Airport" },
  { code: "CDG", city: "Paris", country: "France", name: "Charles de Gaulle" },
  { code: "DXB", city: "Dubai", country: "UAE", name: "Dubai Intl Airport" },
  { code: "HND", city: "Tokyo", country: "Japan", name: "Haneda Airport" },
  { code: "SIN", city: "Singapore", country: "Singapore", name: "Changi Airport" },
  { code: "BKK", city: "Bangkok", country: "Thailand", name: "Suvarnabhumi Airport" },
  { code: "SYD", city: "Sydney", country: "Australia", name: "Kingsford Smith Airport" },
  { code: "DOH", city: "Doha", country: "Qatar", name: "Hamad Intl Airport" }
];

const EXPLORE_DESTINATIONS = [
  { dep: "DEL", arr: "BOM", title: "Mumbai & West Coast", subtitle: "Financial hub & seaside charm", tag: "Popular Corridor", image: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=600&q=70" },
  { dep: "JFK", arr: "LHR", title: "London & UK", subtitle: "Historic landmarks & culture", tag: "Transatlantic", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=70" },
  { dep: "CDG", arr: "DXB", title: "Dubai & Middle East", subtitle: "Futuristic sky scrapers & shopping", tag: "Global Hub", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=70" },
  { dep: "LAX", arr: "HND", title: "Tokyo & Japan", subtitle: "Vibrant cityscapes & temples", tag: "Pacific Route", image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=70" }
];

export default function FlightBookingPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Search preferences
  const [tripType, setTripType] = useState("2"); // 1 = Roundtrip, 2 = Oneway
  const [travelersCount, setTravelersCount] = useState(1);
  const [travelClass, setTravelClass] = useState("1"); // 1 = Economy, 2 = Premium, 3 = Business, 4 = First
  const [currency, setCurrency] = useState("INR");

  const todayString = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Inputs
  const [departureQuery, setDepartureQuery] = useState("DEL");
  const [departureId, setDepartureId] = useState("DEL");

  const [arrivalQuery, setArrivalQuery] = useState("BOM");
  const [arrivalId, setArrivalId] = useState("BOM");

  const [showDepMenu, setShowDepMenu] = useState(false);
  const [showArrMenu, setShowArrMenu] = useState(false);

  const depRef = useRef(null);
  const arrRef = useRef(null);

  const [outboundDate, setOutboundDate] = useState(() => {
    const nextWeek = new Date(Date.now() + 86400000 * 7);
    return nextWeek.toISOString().split("T")[0];
  });
  const [returnDate, setReturnDate] = useState(() => {
    const twoWeeks = new Date(Date.now() + 86400000 * 14);
    return twoWeeks.toISOString().split("T")[0];
  });

  // Animation overlay state
  const [isTakingOff, setIsTakingOff] = useState(false);
  const [takeoffStep, setTakeoffStep] = useState(0);

  useEffect(() => {
    let active = true;

    const loadUserData = async () => {
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
    };

    loadUserData();

    // Click outside listener for airport menus
    const handleClickOutside = (event) => {
      if (depRef.current && !depRef.current.contains(event.target)) {
        setShowDepMenu(false);
      }
      if (arrRef.current && !arrRef.current.contains(event.target)) {
        setShowArrMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      active = false;
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [router]);

  // Autocomplete filtering using Master Airport Dataset
  const filteredDepAirports = useMemo(() => {
    return searchMasterAirports(departureQuery);
  }, [departureQuery]);

  const filteredArrAirports = useMemo(() => {
    return searchMasterAirports(arrivalQuery);
  }, [arrivalQuery]);

  const handleSwapAirports = () => {
    const tempQ = departureQuery;
    const tempId = departureId;
    setDepartureQuery(arrivalQuery);
    setDepartureId(arrivalId);
    setArrivalQuery(tempQ);
    setArrivalId(tempId);
  };

  const selectDepAirport = (ap) => {
    setDepartureQuery(`${ap.city} (${ap.code})`);
    setDepartureId(ap.code);
    setShowDepMenu(false);
  };

  const selectArrAirport = (ap) => {
    setArrivalQuery(`${ap.city} (${ap.code})`);
    setArrivalId(ap.code);
    setShowArrMenu(false);
  };

  const triggerSearchAnimationAndNavigate = (overrideDep = null, overrideArr = null) => {
    let dep = (overrideDep || departureId || departureQuery || "DEL").trim().toUpperCase();
    let arr = (overrideArr || arrivalId || arrivalQuery || "BOM").trim().toUpperCase();

    // Resolve typed city name to official 3-letter IATA code if not already 3 letters
    if (dep.length !== 3) {
      const match = searchMasterAirports(dep)[0];
      if (match) dep = match.code;
    }
    if (arr.length !== 3) {
      const match = searchMasterAirports(arr)[0];
      if (match) arr = match.code;
    }

    setIsTakingOff(true);
    setTakeoffStep(1);

    setTimeout(() => setTakeoffStep(2), 600);
    setTimeout(() => setTakeoffStep(3), 1200);

    setTimeout(() => {
      const url = `/flights/results?departure_id=${encodeURIComponent(dep)}&arrival_id=${encodeURIComponent(arr)}&outbound_date=${encodeURIComponent(outboundDate)}&return_date=${encodeURIComponent(tripType === "1" ? returnDate : "")}&currency=${encodeURIComponent(currency)}&travel_class=${encodeURIComponent(travelClass)}&type=${encodeURIComponent(tripType)}`;
      router.push(url);
    }, 1800);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    triggerSearchAnimationAndNavigate();
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_50%,_#ffffff_100%)] text-slate-900 font-sans">
        <div className="relative flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-sky-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-xs font-bold tracking-wide text-slate-500 uppercase tracking-widest animate-pulse">Launching Flight Search Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_50%,_#ffffff_100%)] text-slate-900 font-sans antialiased relative">

      {/* ── FLIGHT BOARDING ANIMATION OVERLAY ── */}
      {isTakingOff && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center font-sans overflow-hidden"
          style={{ background: "linear-gradient(160deg, #0b1120 0%, #0f1f3d 40%, #0c1a35 100%)" }}>

          {/* Stars background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(40)].map((_, i) => (
              <div key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: `${Math.random() * 2 + 1}px`,
                  height: `${Math.random() * 2 + 1}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.6 + 0.2,
                  animation: `pulse ${Math.random() * 3 + 2}s ease-in-out infinite`
                }}
              />
            ))}
          </div>

          {/* Boarding Pass Card */}
          <div className="relative z-10 w-full max-w-sm mx-4">
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-sky-900/50">

              {/* Top strip — airline bar */}
              <div className="bg-gradient-to-r from-sky-600 to-indigo-700 px-6 py-3 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/80">TripEZ Air</span>
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/70">Boarding Pass</span>
              </div>

              {/* Main content */}
              <div className="px-6 py-5 space-y-5">

                {/* Route row */}
                <div className="flex items-center justify-between gap-4">
                  <div className="text-left">
                    <p className="text-3xl font-black text-white tracking-tighter">{departureId}</p>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Origin</p>
                  </div>

                  {/* Animated plane traversal */}
                  <div className="flex-1 relative flex flex-col items-center justify-center gap-1">
                    {/* Cloud decorations */}
                    <div className="absolute -top-3 left-2 text-white/10 text-2xl select-none"><span className="mi text-2xl">cloud</span></div>
                    <div className="absolute -bottom-2 right-3 text-white/10 text-lg select-none"><span className="mi text-xl">cloud</span></div>

                    {/* Route line with animated plane */}
                    <div className="relative w-full flex items-center">
                      <div className="h-px w-full border-t-2 border-dashed border-white/20" />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-in-out"
                        style={{ left: `${((takeoffStep - 1) / 2) * 80}%` }}
                      >
                        <span className="mi text-[28px] text-sky-400 drop-shadow-[0_0_6px_rgba(56,189,248,0.8)]">flight</span>
                      </div>
                    </div>

                    <p className="text-[10px] font-bold text-sky-400/70 uppercase tracking-widest mt-2">
                      {tripType === "2" ? "One Way" : "Roundtrip"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-3xl font-black text-white tracking-tighter">{arrivalId}</p>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Destination</p>
                  </div>
                </div>

                {/* Dotted divider with circle cuts */}
                <div className="relative flex items-center -mx-6">
                  <div className="h-px w-full border-t border-dashed border-white/10" />
                  <div className="absolute -left-3 h-6 w-6 rounded-full bg-[#0f1f3d] border border-white/10" />
                  <div className="absolute -right-3 h-6 w-6 rounded-full bg-[#0f1f3d] border border-white/10" />
                </div>

                {/* Details row */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Date</p>
                    <p className="text-xs font-extrabold text-white mt-0.5 truncate">{outboundDate || "Flexible"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Class</p>
                    <p className="text-xs font-extrabold text-white mt-0.5">
                      {{ "1": "Economy", "2": "Premium", "3": "Business", "4": "First" }[travelClass] || "Economy"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Status</p>
                    <p className="text-xs font-extrabold text-emerald-400 mt-0.5 animate-pulse">SEARCHING</p>
                  </div>
                </div>

                {/* Barcode stripe */}
                <div className="flex items-end gap-px justify-center h-8 mt-1 opacity-30">
                  {[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2, 3, 8, 4, 6, 2, 6, 4, 3].map((h, i) => (
                    <div key={i} className="bg-white/80 rounded-full" style={{ width: "2px", height: `${h * 3}px` }} />
                  ))}
                </div>
              </div>

              {/* Status footer */}
              <div className="bg-white/5 border-t border-white/10 px-6 py-3">
                <p className="text-[11px] font-bold text-center text-slate-300 transition-all duration-300 flex items-center justify-center gap-2">
                  {takeoffStep === 1 && <><span className="mi text-sm text-sky-400">search</span> Connecting to Google Flights radar...</>}
                  {takeoffStep === 2 && <><span className="mi text-sm text-sky-400">bolt</span> Scanning live fares from 450+ airlines...</>}
                  {takeoffStep === 3 && <><span className="mi text-sm text-sky-400">flight_takeoff</span> Preparing your results deck...</>}
                </p>
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 mt-5">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-1.5 rounded-full transition-all duration-500 ${takeoffStep >= step ? "bg-sky-400 w-6" : "bg-white/20 w-1.5"
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}


      {/* REUSABLE SIDEBAR NAVIGATION */}
      <Sidebar
        userName={userName}
        handleSignOut={handleSignOut}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* MAIN CONTENT CONTAINER */}
      <main className={`flex-1 w-full min-w-0 overflow-x-hidden min-h-screen pt-6 md:pt-0 pb-24 md:pb-8 transition-all duration-300 ${isSidebarCollapsed ? "md:pl-20" : "md:pl-64"}`}>
        <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-8 sm:py-10 space-y-6 sm:space-y-8">

          {/* Header Banner */}
          <header className="w-full pb-4 sm:pb-6 border-b border-slate-200/60">
            <div className="flex items-center gap-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-sky-100 text-sky-800 tracking-wider">Google Flights Telemetry</span>
              <span className="text-xs text-slate-400 font-medium">Real-time Fares</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-1 tracking-tight">Flight Search & Airfare Booking</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Compare nonstop flights, airlines, carbon emissions, and fares worldwide.</p>
          </header>

          {/* MAIN SEARCH DECK WIDGET */}
          <section className="w-full bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-8 shadow-xl shadow-slate-200/60 backdrop-blur-md space-y-6">
            <form onSubmit={handleFormSubmit} className="space-y-6">

              {/* Trip Preferences Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setTripType("1")}
                    className={`trip-toggle px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${tripType === "1" ? "bg-white text-slate-900 shadow-2xs active" : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    Roundtrip
                  </button>
                  <button
                    type="button"
                    onClick={() => setTripType("2")}
                    className={`trip-toggle px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${tripType === "2" ? "bg-white text-slate-900 shadow-2xs active" : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    One-way
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-2 bg-slate-100/90 px-2.5 py-1.5 rounded-2xl border border-slate-300">
                    <span className="text-xs font-extrabold text-slate-600">Travelers:</span>
                    <button
                      type="button"
                      onClick={() => setTravelersCount(Math.max(1, travelersCount - 1))}
                      className="h-6 w-6 rounded-lg bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-slate-200 cursor-pointer text-xs"
                    >
                      -
                    </button>
                    <span className="text-xs font-black text-slate-900 min-w-[16px] text-center">{travelersCount}</span>
                    <button
                      type="button"
                      onClick={() => setTravelersCount(Math.min(9, travelersCount + 1))}
                      className="h-6 w-6 rounded-lg bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-slate-200 cursor-pointer text-xs"
                    >
                      +
                    </button>
                  </div>

                  <select
                    value={travelClass}
                    onChange={(e) => setTravelClass(e.target.value)}
                    className="px-3 py-1.5 rounded-2xl border border-slate-300 bg-slate-100/90 text-xs font-extrabold text-slate-800 outline-none cursor-pointer hover:border-slate-400 focus:bg-white focus:border-sky-600"
                  >
                    <option value="1">Economy</option>
                    <option value="2">Premium Eco</option>
                    <option value="3">Business</option>
                    <option value="4">First Class</option>
                  </select>

                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="px-3 py-1.5 rounded-2xl border border-slate-300 bg-slate-100/90 text-xs font-extrabold text-slate-800 outline-none cursor-pointer hover:border-slate-400 focus:bg-white focus:border-sky-600"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              {/* Primary Search Inputs Grid with Airport Swap & Autocomplete Dropdowns */}
              <div className={`grid grid-cols-1 ${tripType === "1" ? "lg:grid-cols-[1fr_auto_1fr_1fr_1fr]" : "lg:grid-cols-[1fr_auto_1fr_1fr]"} items-center gap-3`}>

                {/* Departure Input with Autocomplete */}
                <div ref={depRef} className="space-y-1 relative">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block">From (City or Code)</label>
                  <div className="input-interactive relative rounded-2xl border border-slate-300 bg-slate-100/90 hover:bg-slate-100 hover:border-slate-400 focus-within:bg-white focus-within:border-sky-600 focus-within:ring-2 focus-within:ring-sky-200 shadow-xs">
                    <input
                      type="text"
                      required
                      value={departureQuery}
                      onChange={(e) => {
                        setDepartureQuery(e.target.value);
                        setDepartureId(e.target.value);
                        setShowDepMenu(true);
                      }}
                      onFocus={() => setShowDepMenu(true)}
                      placeholder="e.g. Delhi or DEL"
                      className="w-full px-4 py-3 bg-transparent text-sm font-black text-slate-900 outline-none placeholder-slate-400"
                    />
                    <span className="absolute right-3 top-3.5 text-[10px] font-extrabold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100 uppercase">{departureId}</span>
                  </div>

                  {/* Departure Autocomplete Dropdown Menu */}
                  {showDepMenu && filteredDepAirports.length > 0 && (
                    <div className="animate-slide-up absolute z-40 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100">
                      {filteredDepAirports.map((ap) => (
                        <div
                          key={ap.code}
                          onClick={() => selectDepAirport(ap)}
                          className="px-4 py-2.5 hover:bg-sky-50 cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div>
                            <p className="text-xs font-black text-slate-900">{ap.city}, {ap.country}</p>
                            <p className="text-[10px] font-semibold text-slate-400">{ap.name}</p>
                          </div>
                          <span className="text-xs font-black text-sky-700 bg-sky-100 px-2 py-0.5 rounded-lg">{ap.code}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Swap Button */}
                <div className="flex justify-center my-0.5 lg:my-0 lg:pt-4">
                  <button
                    type="button"
                    onClick={handleSwapAirports}
                    className="swap-btn h-9 w-9 lg:h-10 lg:w-10 rounded-2xl bg-slate-100 hover:bg-sky-50 border border-slate-300 hover:border-sky-400 text-slate-700 hover:text-sky-600 flex items-center justify-center cursor-pointer shadow-xs"
                    title="Swap Departure and Arrival"
                  >
                    <span className="mi text-[20px]">swap_horiz</span>
                  </button>
                </div>

                {/* Arrival Input with Autocomplete */}
                <div ref={arrRef} className="space-y-1 relative">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block">To (City or Code)</label>
                  <div className="input-interactive relative rounded-2xl border border-slate-300 bg-slate-100/90 hover:bg-slate-100 hover:border-slate-400 focus-within:bg-white focus-within:border-sky-600 focus-within:ring-2 focus-within:ring-sky-200 shadow-xs">
                    <input
                      type="text"
                      required
                      value={arrivalQuery}
                      onChange={(e) => {
                        setArrivalQuery(e.target.value);
                        setArrivalId(e.target.value);
                        setShowArrMenu(true);
                      }}
                      onFocus={() => setShowArrMenu(true)}
                      placeholder="e.g. Mumbai or BOM"
                      className="w-full px-4 py-3 bg-transparent text-sm font-black text-slate-900 outline-none placeholder-slate-400"
                    />
                    <span className="absolute right-3 top-3.5 text-[10px] font-extrabold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100 uppercase">{arrivalId}</span>
                  </div>

                  {/* Arrival Autocomplete Dropdown Menu */}
                  {showArrMenu && filteredArrAirports.length > 0 && (
                    <div className="animate-slide-up absolute z-40 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100">
                      {filteredArrAirports.map((ap) => (
                        <div
                          key={ap.code}
                          onClick={() => selectArrAirport(ap)}
                          className="px-4 py-2.5 hover:bg-sky-50 cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div>
                            <p className="text-xs font-black text-slate-900">{ap.city}, {ap.country}</p>
                            <p className="text-[10px] font-semibold text-slate-400">{ap.name}</p>
                          </div>
                          <span className="text-xs font-black text-sky-700 bg-sky-100 px-2 py-0.5 rounded-lg">{ap.code}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Departure Date */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block">Departure Date</label>
                  <div className="relative rounded-2xl border border-slate-300 bg-slate-100/90 hover:bg-slate-100 hover:border-slate-400 focus-within:bg-white focus-within:border-sky-600 focus-within:ring-2 focus-within:ring-sky-200 transition-all duration-200 shadow-xs">
                    <input
                      type="date"
                      required
                      min={todayString}
                      value={outboundDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOutboundDate(val);
                        if (returnDate && val > returnDate) {
                          setReturnDate(val);
                        }
                      }}
                      className="w-full px-4 py-2.5 bg-transparent text-xs font-extrabold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                {/* Return Date - Only rendered for Roundtrip */}
                {tripType === "1" && (
                  <div className="space-y-1 animate-fade-in">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block">Return Date</label>
                    <div className="relative rounded-2xl border border-slate-300 bg-slate-100/90 hover:bg-slate-100 hover:border-slate-400 focus-within:bg-white focus-within:border-sky-600 transition-all duration-200 shadow-xs">
                      <input
                        type="date"
                        min={outboundDate || todayString}
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-transparent text-xs font-extrabold text-slate-900 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isTakingOff}
                  className="btn-glow w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 text-xs font-extrabold text-white shadow-lg shadow-sky-200 disabled:opacity-75 cursor-pointer shrink-0 flex items-center gap-2 justify-center"
                >
                  <span className="mi text-base">flight</span>
                  Search Flights
                </button>
              </div>
            </form>
          </section>

          {/* POPULAR EXPLORATION ROUTES */}
          <section className="w-full space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-700 px-1">Popular Flight Corridors to Explore</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {EXPLORE_DESTINATIONS.map((dest) => (
                <div
                  key={dest.title}
                  onClick={() => {
                    setDepartureQuery(dest.dep);
                    setDepartureId(dest.dep);
                    setArrivalQuery(dest.arr);
                    setArrivalId(dest.arr);
                    triggerSearchAnimationAndNavigate(dest.dep, dest.arr);
                  }}
                  className="explore-card group relative h-32 rounded-3xl overflow-hidden shadow-md border border-slate-200/90 cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={dest.image} alt={dest.title} className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/50 to-transparent p-4 flex flex-col justify-between">
                    <span className="self-end px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-500/90 text-white backdrop-blur-xs shadow-2xs">{dest.tag}</span>
                    <div>
                      <p className="text-sm font-extrabold text-white tracking-tight">{dest.title}</p>
                      <p className="text-[11px] font-medium text-slate-300 truncate">{dest.subtitle}</p>
                      <p className="text-[10px] font-bold text-sky-300 mt-1 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span className="mi text-sm">arrow_forward</span>
                        Explore Live Fares
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
