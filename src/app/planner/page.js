"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const TRAVEL_PHOTOS = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", // Beach
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80", // Mountains
  "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80", // Paris / City
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80", // Lake / Boats
  "https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1200&q=80", // Snow / Gulmarg
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80", // Travel lake boat
  "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80", // Tropical beach
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80", // Map travel passport
  "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80", // Forest/Autumn roads
  "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=80", // European architecture
  "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=1200&q=80", // Travel adventure
  "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80"  // Vietnam mountains/nature
];

const hashStringToIndexes = (str, count, maxIndex) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  const indexes = [];
  for (let i = 0; i < count; i++) {
    indexes.push((hash + i * 3) % maxIndex);
  }
  return indexes;
};

const buildTripGallery = (destination = "") => {
  const cleanDest = destination ? destination.split(",").map(s => s.trim()).filter(Boolean).join(", ") : "";
  const lowerDestination = cleanDest.toLowerCase();

  if (lowerDestination.includes("gulmarg") || lowerDestination.includes("snow") || lowerDestination.includes("winter")) {
    return [
      "https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1200&q=80",
    ];
  }

  if (lowerDestination.includes("srinagar") || lowerDestination.includes("dal") || lowerDestination.includes("lake")) {
    return [
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
    ];
  }

  const indexes = hashStringToIndexes(lowerDestination, 4, TRAVEL_PHOTOS.length);
  return indexes.map(idx => TRAVEL_PHOTOS[idx]);
};

// Location options data structure for drop-downs
const LOCATION_DATA = {
  "India": {
    "Jammu & Kashmir": ["Gulmarg", "Srinagar", "Pahalgam", "Sonamarg"],
    "Kerala": ["Munnar", "Alleppey", "Kochi", "Wayanad"],
    "Rajasthan": ["Jaipur", "Udaipur", "Jodhpur", "Jaisalmer"],
    "Goa": ["North Goa Beaches", "South Goa Beaches", "Panaji"],
    "Himachal Pradesh": ["Manali", "Shimla", "Dharamshala", "Spiti Valley"]
  },
  "France": {
    "Île-de-France": ["Paris", "Versailles"],
    "Provence-Alpes-Côte d'Azur": ["Nice", "Marseille", "Cannes", "Aix-en-Provence"],
    "Auvergne-Rhône-Alpes": ["Chamonix", "Lyon"]
  },
  "Japan": {
    "Kanto": ["Tokyo", "Hakone", "Yokohama"],
    "Kansai": ["Kyoto", "Osaka", "Nara", "Kobe"],
    "Hokkaido": ["Sapporo", "Otaru", "Niseko"]
  },
  "United States of America": {
    "California": ["San Francisco", "Los Angeles", "Yosemite National Park", "San Diego"],
    "New York": ["New York City", "Upstate NY", "Niagara Falls"],
    "Hawaii": ["Honolulu (Oahu)", "Maui", "Kauai"]
  }
};

const ALL_COUNTRIES = Object.keys(LOCATION_DATA);

const parseDestination = (destinationStr) => {
  const result = {
    selectedCountry: "",
    customCountry: "",
    selectedState: "",
    customState: "",
    selectedPlace: "",
    customPlace: ""
  };
  
  if (!destinationStr) return result;
  
  const parts = destinationStr.split(",").map(s => s.trim());
  
  if (parts.length === 3) {
    const place = parts[0];
    const state = parts[1];
    const country = parts[2];
    
    if (ALL_COUNTRIES.includes(country)) {
      result.selectedCountry = country;
    } else if (country) {
      result.selectedCountry = "custom";
      result.customCountry = country;
    }
    
    if (state) {
      const states = LOCATION_DATA[result.selectedCountry];
      if (states && states[state]) {
        result.selectedState = state;
      } else {
        result.selectedState = "custom";
        result.customState = state;
      }
    }
    
    if (place) {
      const states = LOCATION_DATA[result.selectedCountry];
      if (states && result.selectedState && states[result.selectedState] && states[result.selectedState].includes(place)) {
        result.selectedPlace = place;
      } else {
        result.selectedPlace = "custom";
        result.customPlace = place;
      }
    }
    
    return result;
  }
  
  if (parts.length === 2) {
    const place = parts[0];
    const country = parts[1];
    
    if (ALL_COUNTRIES.includes(country)) {
      result.selectedCountry = country;
      
      const states = LOCATION_DATA[country];
      if (states) {
        if (states[place]) {
          result.selectedState = place;
        } else {
          let foundState = "";
          for (const stateName in states) {
            if (states[stateName].includes(place)) {
              foundState = stateName;
              break;
            }
          }
          if (foundState) {
            result.selectedState = foundState;
            result.selectedPlace = place;
          } else {
            result.selectedState = "custom";
            result.customState = "";
            result.selectedPlace = "custom";
            result.customPlace = place;
          }
        }
      } else {
        result.selectedState = "custom";
        result.customState = "";
        result.selectedPlace = "custom";
        result.customPlace = place;
      }
      return result;
    }
  }
  
  if (parts.length === 1) {
    const country = parts[0];
    if (ALL_COUNTRIES.includes(country)) {
      result.selectedCountry = country;
      return result;
    }
  }
  
  result.selectedCountry = "custom";
  result.customCountry = destinationStr;
  return result;
};

const formatDestinationDisplay = (destinationStr) => {
  if (!destinationStr) return "";
  const parts = destinationStr.split(",").map(s => s.trim()).filter(Boolean);
  return parts.join(", ");
};

// Inline Navigation Icon Components
const LogoIcon = () => (
  <svg className="h-6 w-6 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
);

const DashboardIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const ExpenseIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12" />
    <path d="M6 8h12" />
    <path d="m6 13 8.5 8" />
    <path d="M6 13h3a4 4 0 0 0 0-8" />
  </svg>
);

const CollabIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const CloseIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const MenuIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const getInitials = (name) => {
  if (!name) return "TE";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0] ? parts[0][0].toUpperCase() : "TE";
};

function PlannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = searchParams.get("tripId");

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [plannerDestination, setPlannerDestination] = useState("");
  const [itinerary, setItinerary] = useState(null);
  const [savedItinerary, setSavedItinerary] = useState(null);
  const [message, setMessage] = useState("");
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    destination: "",
    days: "3",
    travelers: "2",
    interests: "",
    budget: "mid-range",
    style: "balanced",
    notes: ""
  });

  const [selectedCountry, setSelectedCountry] = useState("");
  const [customCountry, setCustomCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [customState, setCustomState] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");
  const [customPlace, setCustomPlace] = useState("");

  const countryHasData = selectedCountry && selectedCountry !== "custom" && Boolean(LOCATION_DATA[selectedCountry]);

  // Form selections synchronization handler
  useEffect(() => {
    let parts = [];
    if (selectedCountry) {
      if (selectedCountry === "custom") {
        if (customCountry.trim()) parts.push(customCountry.trim());
      } else {
        if (selectedPlace) {
          if (selectedPlace === "custom") {
            if (customPlace.trim()) parts.push(customPlace.trim());
          } else {
            parts.push(selectedPlace);
          }
        }
        if (selectedState) {
          if (selectedState === "custom") {
            if (customState.trim()) parts.push(customState.trim());
          } else {
            parts.push(selectedState);
          }
        }
        parts.push(selectedCountry);
      }
    }
    setForm(f => ({ ...f, destination: parts.join(", ") }));
  }, [selectedCountry, customCountry, selectedState, customState, selectedPlace, customPlace]);

  useEffect(() => {
    const loadTripData = async () => {
      if (!supabase) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      setUserId(session.user.id);
      setUserName(session.user?.user_metadata?.full_name || session.user?.email || "your account");

      if (tripId) {
        const { data: trip, error } = await supabase
          .from("trips")
          .select("name, destination, dates, travelers, interests, notes, itinerary")
          .eq("id", tripId)
          .single();

        if (error) {
          setMessage("We couldn't load this trip details.");
        } else if (trip) {
          setPlannerDestination(trip.destination);
          
          let parsedDuration = "3";
          if (trip.dates) {
            const match = trip.dates.match(/(\d+)\s+days/);
            if (match) parsedDuration = match[1];
          }

          setForm({
            name: trip.name || "",
            destination: trip.destination || "",
            days: parsedDuration,
            travelers: String(trip.travelers || "2"),
            interests: trip.interests || "",
            budget: "mid-range",
            style: "balanced",
            notes: trip.notes || ""
          });

          // Sync destination dropdown selections
          const destState = parseDestination(trip.destination);
          setSelectedCountry(destState.selectedCountry);
          setCustomCountry(destState.customCountry);
          setSelectedState(destState.selectedState);
          setCustomState(destState.customState);
          setSelectedPlace(destState.selectedPlace);
          setCustomPlace(destState.customPlace);

          if (trip.itinerary) {
            let parsedItinerary = trip.itinerary;
            if (typeof trip.itinerary === "string") {
              try {
                parsedItinerary = JSON.parse(trip.itinerary);
              } catch (e) {
                console.error("Failed to parse itinerary JSON string:", e);
              }
            }
            setItinerary(parsedItinerary);
            setSavedItinerary(parsedItinerary);
          }
        }
      }
      setLoading(false);
    };

    loadTripData();
  }, [tripId, router]);

  const handleCountrySelect = (val) => {
    setSelectedCountry(val);
    setSelectedState("");
    setCustomState("");
    setSelectedPlace("");
    setCustomPlace("");
    setCustomCountry("");
  };

  const handleStateSelect = (val) => {
    setSelectedState(val);
    setSelectedPlace("");
    setCustomPlace("");
    setCustomState("");
  };

  const handlePlaceSelect = (val) => {
    setSelectedPlace(val);
    setCustomPlace("");
  };

  const handleCustomCountryChange = (val) => {
    setCustomCountry(val);
  };

  const handleCustomStateChange = (val) => {
    setCustomState(val);
  };

  const handleCustomPlaceChange = (val) => {
    setCustomPlace(val);
  };

  const handleGenerateItinerary = async (event) => {
    event.preventDefault();

    if (!form.destination.trim()) {
      setMessage("Please select a destination first.");
      return;
    }
    if (!form.days || Number(form.days) < 1) {
      setMessage("Please enter a valid trip duration (at least 1 day).");
      return;
    }
    if (!form.travelers || Number(form.travelers) < 1) {
      setMessage("Please specify travelers.");
      return;
    }
    if (!form.interests.trim()) {
      setMessage("Please describe some interests.");
      return;
    }

    setGenerating(true);
    setMessage("");

    try {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: tripId }),
      });

      if (!res.ok) {
        throw new Error("Unable to contact itinerary service.");
      }

      const result = await res.json();
      if (result?.error) {
        throw new Error(result.error);
      }

      setItinerary(result.itinerary);
      setPlannerDestination(form.destination);
      setActiveDayIndex(0);
      setMessage("AI itinerary generated successfully.");
    } catch (error) {
      setMessage(`Itinerary generation failed: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveItinerary = async () => {
    if (!supabase || !tripId || !itinerary) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("trips")
      .update({ itinerary: itinerary })
      .eq("id", tripId);

    setSaving(true); // Wait, setting saving true? Let's keep it clean
    setSaving(false);

    if (error) {
      setMessage("We couldn't save the itinerary. Please try again.");
    } else {
      setSavedItinerary(itinerary);
      setMessage("Itinerary saved successfully to your trip!");
    }
  };

  const handleGenerateNew = () => {
    setItinerary(null);
    setMessage("");
  };



  const parsePlanByTimeOfDay = (planText) => {
    const result = {
      morning: [],
      afternoon: [],
      evening: []
    };

    if (!planText) return result;
    const lines = planText.split(/\n+/).map(s => s.trim()).filter(Boolean);

    lines.forEach((line) => {
      const lowerLine = line.toLowerCase();
      const match = line.match(/^\*\*(.*?)\*\*:(.*)$/) || line.match(/^\*\*(.*?)\*\*(.*)$/);
      const timeStr = match ? match[1].trim() : "";
      const contentStr = match ? match[2].trim() : line;
      
      const event = { time: timeStr, content: contentStr };

      if (lowerLine.includes("morning") || lowerLine.includes("breakfast") || /^(0?[5-9]|10|11):/i.test(timeStr) || /^[5-9]am|[10-11]am/i.test(timeStr)) {
        result.morning.push(event);
      } else if (lowerLine.includes("afternoon") || lowerLine.includes("lunch") || /^(12|0?[1-4]):/i.test(timeStr) || /^12pm|[1-4]pm/i.test(timeStr)) {
        result.afternoon.push(event);
      } else if (lowerLine.includes("evening") || lowerLine.includes("dinner") || lowerLine.includes("dine") || /^(0?[5-9]|10|11):.*pm/i.test(timeStr) || /^[5-9]pm|[10-11]pm/i.test(timeStr) || /^(17|18|19|20|21|22|23):/i.test(timeStr)) {
        result.evening.push(event);
      } else {
        if (result.morning.length < 2) {
          result.morning.push(event);
        } else if (result.afternoon.length < 2) {
          result.afternoon.push(event);
        } else {
          result.evening.push(event);
        }
      }
    });

    return result;
  };

  const formatPlanText = (text) => {
    if (!text) return "";
    return text.replace(/\*\*(.*?)\*\*/g, "$1");
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/");
  };

  const gallery = useMemo(() => buildTripGallery(plannerDestination), [plannerDestination]);

  const summary = useMemo(() => {
    if (!itinerary) return null;
    return {
      title: itinerary.title || `${formatDestinationDisplay(form.destination)} Adventure`,
      overview: itinerary.overview || "A tailored plan is ready.",
      days: itinerary.days || [],
      tips: itinerary.tips || [],
    };
  }, [form.destination, itinerary]);

  const itineraryStats = useMemo(() => {
    if (!summary) return [];
    return [
      { label: "Days", value: String(summary.days?.length || form.days) },
      { label: "Budget", value: form.budget },
      { label: "Vibe", value: form.style }
    ];
  }, [summary, form.budget, form.style, form.days]);

  const activeDay = summary?.days?.[activeDayIndex];

  const activeDaySections = useMemo(() => {
    return activeDay 
      ? parsePlanByTimeOfDay(activeDay.plan) 
      : { morning: [], afternoon: [], evening: [] };
  }, [activeDay]);


  const activeDayHighlights = useMemo(() => {
    if (!activeDay) return [];
    const matches = [];
    const rx = /\*\*(.*?)\*\*/g;
    let match;
    while ((match = rx.exec(activeDay.plan)) !== null) {
      if (match[1]?.trim() && !matches.includes(match[1].trim())) {
        matches.push(match[1].trim());
      }
    }
    return matches.slice(0, 5);
  }, [activeDay]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_50%,_#ffffff_100%)] text-slate-900 font-sans">
        <div className="relative flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-sky-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-xs font-bold tracking-wide text-slate-500 uppercase tracking-widest animate-pulse">Loading itinerary planner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_50%,_#ffffff_100%)] text-slate-900 font-sans antialiased overflow-x-hidden w-full">
      
      {/* DESKTOP SIDEBAR NAVIGATION */}
      <aside className="hidden md:flex flex-col justify-between fixed top-0 bottom-0 left-0 w-64 bg-white/70 border-r border-slate-200/60 backdrop-blur-md p-6 z-30">
        <div className="space-y-8">
          <Link href="/dashboard" className="flex items-center gap-3 px-2 hover:opacity-85 transition-opacity">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-sky-100">
              <LogoIcon />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">TripEZ</span>
          </Link>

          <nav className="space-y-1.5 font-sans">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200">
              <DashboardIcon />
              <span className="text-sm">Dashboard</span>
            </Link>
            
            <Link href="/documents" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200">
              <DocumentIcon />
              <span className="text-sm">Document Vault</span>
            </Link>

            <Link href="/expenses" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200">
              <ExpenseIcon />
              <span className="text-sm">Expense Tracker</span>
            </Link>

            <Link href="/trip-collab" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200">
              <CollabIcon />
              <span className="text-sm">Collaboration</span>
            </Link>
          </nav>
        </div>

        {/* User profile bottom item */}
        <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between gap-3 font-sans">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 text-sm font-bold text-white shadow-md">
              {getInitials(userName)}
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Traveler</p>
              <p className="text-sm font-bold text-slate-900 truncate" title={userName}>{userName}</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogoutIcon />
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER BAR */}
      <header className="flex md:hidden items-center justify-between px-6 py-4 bg-white/70 border-b border-slate-200/60 backdrop-blur-md fixed top-0 left-0 right-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
            <LogoIcon />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">TripEZ</span>
        </Link>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <MenuIcon />
        </button>
      </header>

      {/* MOBILE DRAWER OVERLAY */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 md:hidden ${isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div 
          className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs"
          onClick={() => setIsSidebarOpen(false)}
        />
        <div className={`absolute top-0 bottom-0 left-0 w-72 bg-white p-6 shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 hover:opacity-85 transition-opacity">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
                  <LogoIcon />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">TripEZ</span>
              </Link>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            <nav className="space-y-1.5">
              <Link href="/dashboard" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200">
                <DashboardIcon />
                <span className="text-sm">Dashboard</span>
              </Link>
              
              <Link href="/documents" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200">
                <DocumentIcon />
                <span className="text-sm">Document Vault</span>
              </Link>

              <Link href="/expenses" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200">
                <ExpenseIcon />
                <span className="text-sm">Expense Tracker</span>
              </Link>

              <Link href="/trip-collab" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200">
                <CollabIcon />
                <span className="text-sm">Collaboration</span>
              </Link>
            </nav>
          </div>

          <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 text-sm font-bold text-white shadow-md">
                {getInitials(userName)}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Traveler</p>
                <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
              </div>
            </div>
            <button 
              onClick={handleSignOut}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 md:pl-64 pt-20 md:pt-0 min-h-screen">
        <div className="px-4 py-8 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-6xl w-full space-y-8">
            
            {/* Header Block */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 shadow-inner text-xl">
                  ✈
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-sky-700">AI Trip Planner</p>
                  <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">Itinerary Builder</h1>
                </div>
              </div>
            </div>

            <div className="bg-white/70 border border-slate-200/60 p-4.5 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-xs backdrop-blur-md">
              <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed max-w-3xl">
                Input parameters for your travel duration, group count, budget style, and activities list to generate a customized AI-guided travel itinerary.
              </p>
            </div>

            {/* Primary split layout grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-8 w-full">
              
              {/* Trip Parameters Setup Form */}
              <section className="space-y-6 w-full">
                <form onSubmit={handleGenerateItinerary} className="space-y-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-xl shadow-sky-100/40 w-full">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">Trip Configuration</h2>
                    <p className="text-xs text-slate-500 mt-1">Specify destination parameters for custom AI scheduling.</p>
                  </div>

                  {/* Destination selector */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Destination</label>
                    
                    <div className="grid gap-3.5 grid-cols-1">
                      {/* Country Selection */}
                      <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                        <span className="absolute left-4 top-3.5 text-slate-400">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                        </span>
                        <select
                          value={selectedCountry}
                          onChange={(event) => handleCountrySelect(event.target.value)}
                          className="w-full pl-11 pr-10 py-3 bg-transparent text-sm text-slate-900 outline-none appearance-none cursor-pointer placeholder-slate-400"
                        >
                          <option value="">Select Country...</option>
                          {ALL_COUNTRIES.map((country) => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                        <span className="absolute right-4 top-4 text-slate-400 pointer-events-none">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </div>

                      {/* State selection */}
                      {selectedCountry && (
                        countryHasData ? (
                          <div className="space-y-3.5">
                            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                              <span className="absolute left-4 top-3.5 text-slate-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                              </span>
                              <select
                                value={selectedState}
                                onChange={(event) => handleStateSelect(event.target.value)}
                                className="w-full pl-11 pr-10 py-3 bg-transparent text-sm text-slate-900 outline-none appearance-none cursor-pointer"
                              >
                                <option value="">Select State/Region...</option>
                                {Object.keys(LOCATION_DATA[selectedCountry] || {}).map((state) => (
                                  <option key={state} value={state}>{state}</option>
                                ))}
                                <option value="custom">Other / Custom...</option>
                              </select>
                              <span className="absolute right-4 top-4 text-slate-400 pointer-events-none">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                              </span>
                            </div>
                            
                            {selectedState === "custom" && (
                              <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                                <span className="absolute left-4 top-3.5 text-slate-400">
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  </svg>
                                </span>
                                <input
                                  value={customState}
                                  onChange={(event) => handleCustomStateChange(event.target.value)}
                                  className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-slate-900 outline-none"
                                  placeholder="Type custom state/region..."
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                            <span className="absolute left-4 top-3.5 text-slate-400">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                            </span>
                            <input
                              value={customState}
                              onChange={(event) => handleCustomStateChange(event.target.value)}
                              className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-slate-900 outline-none"
                              placeholder="Type state/region (optional)..."
                            />
                          </div>
                        )
                      )}

                      {/* Place selection */}
                      {selectedCountry && (
                        countryHasData ? (
                          selectedState && (
                            <div className="space-y-3.5">
                              <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                                <span className="absolute left-4 top-3.5 text-slate-400">
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  </svg>
                                </span>
                                <select
                                  value={selectedPlace}
                                  onChange={(event) => handlePlaceSelect(event.target.value)}
                                  className="w-full pl-11 pr-10 py-3 bg-transparent text-sm text-slate-900 outline-none appearance-none cursor-pointer"
                                >
                                  <option value="">Select Place...</option>
                                  {(LOCATION_DATA[selectedCountry]?.[selectedState] || []).map((place) => (
                                    <option key={place} value={place}>{place}</option>
                                  ))}
                                  <option value="custom">Other / Custom...</option>
                                </select>
                                <span className="absolute right-4 top-4 text-slate-400 pointer-events-none">
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                  </svg>
                                </span>
                              </div>
                              
                              {selectedPlace === "custom" && (
                                <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                                  <span className="absolute left-4 top-3.5 text-slate-400">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                  </span>
                                  <input
                                    value={customPlace}
                                    onChange={(event) => handleCustomPlaceChange(event.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-slate-900 outline-none"
                                    placeholder="Type custom place..."
                                  />
                                </div>
                              )}
                            </div>
                          )
                        ) : (
                          selectedCountry && (
                            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                              <span className="absolute left-4 top-3.5 text-slate-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                              </span>
                              <input
                                value={customPlace}
                                onChange={(event) => handleCustomPlaceChange(event.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-slate-900 outline-none"
                                placeholder="Type place or city..."
                              />
                            </div>
                          )
                        )
                      )}
                    </div>
                  </div>

                  {/* Timeline days and travellers info */}
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    <div className="relative">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Duration (Days)</label>
                      <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                        <span className="absolute left-4 top-3.5 text-slate-400">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                        <input
                          type="number"
                          min="1"
                          value={form.days}
                          onChange={(event) => setForm({ ...form, days: event.target.value })}
                          className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-slate-900 outline-none"
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Travelers</label>
                      <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                        <span className="absolute left-4 top-3.5 text-slate-400">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                        </span>
                        <input
                          type="number"
                          min="1"
                          value={form.travelers}
                          onChange={(event) => setForm({ ...form, travelers: event.target.value })}
                          className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-slate-900 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Interests prompt */}
                  <div className="relative">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Interests & Vibes</label>
                    <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                      <span className="absolute left-4 top-3.5 text-slate-400">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </span>
                      <input
                        value={form.interests}
                        onChange={(event) => setForm({ ...form, interests: event.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-slate-900 outline-none placeholder-slate-400"
                        placeholder="e.g. food, museums, nightlife"
                      />
                    </div>
                  </div>

                  {/* Budget & Style */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="relative">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Budget</label>
                      <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                        <select
                          value={form.budget}
                          onChange={(event) => setForm({ ...form, budget: event.target.value })}
                          className="w-full pl-4.5 pr-8 py-3 bg-transparent text-sm text-slate-900 outline-none appearance-none cursor-pointer"
                        >
                          <option value="budget">Budget</option>
                          <option value="mid-range">Mid-range</option>
                          <option value="luxury">Luxury</option>
                        </select>
                        <span className="absolute right-4 top-4 text-slate-400 pointer-events-none">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Style</label>
                      <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                        <select
                          value={form.style}
                          onChange={(event) => setForm({ ...form, style: event.target.value })}
                          className="w-full pl-4.5 pr-8 py-3 bg-transparent text-sm text-slate-900 outline-none appearance-none cursor-pointer"
                        >
                          <option value="balanced">Balanced</option>
                          <option value="relaxed">Relaxed</option>
                          <option value="adventurous">Adventurous</option>
                          <option value="romantic">Romantic</option>
                        </select>
                        <span className="absolute right-4 top-4 text-slate-400 pointer-events-none">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>

                  {message ? (
                    <p className="rounded-2xl bg-sky-50 border border-sky-100 px-4 py-3 text-xs text-sky-700 animate-fade-in font-semibold">{message}</p>
                  ) : null}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={generating}
                    className="w-full rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 py-3.5 text-xs font-bold text-white shadow-lg shadow-sky-100 focus:outline-none transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {generating ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Generating Itinerary...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="h-4 w-4 text-sky-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                          <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5 5 3Z" />
                          <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" />
                        </svg>
                        Generate Itinerary
                      </span>
                    )}
                  </button>
                </form>
              </section>

              {/* RIGHT COLUMN: Plan results display */}
              <section className="space-y-6 w-full">
                <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/30 min-h-[300px] flex flex-col w-full">
                  {summary ? (
                    <div className="flex-1 flex flex-col w-full">
                      {/* Photo Hero Banner */}
                      <div className="relative min-h-[260px] overflow-hidden bg-slate-950 shrink-0 w-full">
                        <Image
                          src={gallery[0]}
                          alt={plannerDestination}
                          fill
                          loading="eager"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover opacity-75"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                        
                        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white w-full">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-sky-300">Generated Itinerary</span>
                          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight leading-none text-white">{summary.title}</h2>
                          <p className="mt-3 max-w-2xl text-xs leading-relaxed text-slate-200 font-semibold opacity-90 line-clamp-2">{summary.overview}</p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {itineraryStats.map((stat) => (
                              <div key={stat.label} className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-md">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-sky-200 mr-1.5">{stat.label}:</span>
                                <span className="text-xs font-bold capitalize tracking-wide text-white">{stat.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Body area */}
                      <div className="space-y-6 p-5 sm:p-6 flex-1 flex flex-col w-full">
                        
                        {/* Action Bar */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 shadow-inner">
                          <div className="flex items-center gap-2">
                            <span className={`flex h-2 w-2 rounded-full ${
                              savedItinerary && JSON.stringify(savedItinerary) === JSON.stringify(itinerary)
                                ? "bg-emerald-500"
                                : "bg-amber-500 animate-pulse"
                            }`}></span>
                            <p className="text-xs font-semibold text-slate-500">
                              {savedItinerary && JSON.stringify(savedItinerary) === JSON.stringify(itinerary)
                                ? "Itinerary is fully synced."
                                : "You have unsaved adjustments."}
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
                            {tripId ? (
                              <button
                                type="button"
                                onClick={handleSaveItinerary}
                                disabled={saving || (savedItinerary && JSON.stringify(savedItinerary) === JSON.stringify(itinerary))}
                                className={`w-full sm:w-auto rounded-full px-5 py-2.5 text-xs font-bold text-white transition shadow-md flex items-center justify-center cursor-pointer ${
                                  savedItinerary && JSON.stringify(savedItinerary) === JSON.stringify(itinerary)
                                    ? "bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600 disabled:text-white disabled:shadow-none disabled:cursor-default"
                                    : "bg-sky-600 hover:bg-sky-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed shadow-sky-100 disabled:shadow-none"
                                }`}
                              >
                                {saving ? "Saving..." : savedItinerary && JSON.stringify(savedItinerary) === JSON.stringify(itinerary) ? "Saved ✓" : "Save Itinerary"}
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-semibold italic text-center py-1 sm:py-0">
                                Link to a dashboard trip to save
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={handleGenerateNew}
                              className="w-full sm:w-auto rounded-full border border-slate-300 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs font-bold text-slate-700 transition shadow-xs cursor-pointer flex items-center justify-center"
                            >
                              Generate New
                            </button>
                          </div>
                        </div>

                        {/* Day select tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                          {summary?.days?.map((day, index) => {
                            const isActive = index === activeDayIndex;

                            return (
                              <button
                                key={`${day.day}-${index}`}
                                type="button"
                                onClick={() => setActiveDayIndex(index)}
                                className={`min-w-28 rounded-2xl border px-4 py-3 text-left transition shrink-0 cursor-pointer ${
                                  isActive
                                    ? "border-sky-500 bg-sky-600 text-white shadow-lg shadow-sky-100"
                                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-350 hover:bg-sky-50/70"
                                }`}
                              >
                                <span className={`text-[10px] font-bold uppercase tracking-wider block ${isActive ? "text-sky-100" : "text-slate-400"}`}>
                                  Day {day.day}
                                </span>
                                <span className="mt-0.5 line-clamp-1 block text-xs font-bold">{day.title}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Route highlighting details */}
                        {activeDay ? (
                          <div className="grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr] gap-5 animate-fade-in w-full">
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                              <div className="relative h-32 overflow-hidden w-full">
                                <Image
                                  src={gallery[activeDayIndex % gallery.length]}
                                  alt={`${plannerDestination} day ${activeDay.day}`}
                                  fill
                                  sizes="(max-width: 768px) 100vw, 20vw"
                                  className="object-cover"
                                />
                              </div>
                              <div className="p-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-sky-700">Timeline Day</p>
                                <p className="mt-1 text-2xl font-black text-slate-900 tracking-tight">Day {activeDay.day}</p>
                              </div>
                            </div>

                            <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3 flex-1">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-sky-700">Daily Route</p>
                                <h3 className="mt-1 text-xl font-bold text-slate-900 leading-tight">{activeDay.title}</h3>
                              </div>
                              
                              {activeDayHighlights.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-0.5">
                                  {activeDayHighlights.map((high, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1 rounded-full bg-sky-50/50 border border-sky-100 px-2.5 py-1 text-[10px] font-semibold text-sky-700 shadow-2xs">
                                      📍 {high}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              <div className="space-y-6 mt-4 border-t border-slate-100 pt-4">
                                
                                {/* 1. MORNING SECTION */}
                                {activeDaySections.morning.length > 0 && (
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-1.5 pl-1">
                                      <svg className="h-4 w-4 text-sky-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                                      </svg>
                                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Morning (08:00 AM - 12:00 PM)</h4>
                                    </div>
                                    
                                    <div className="relative pl-1">
                                      {/* Vertical track line for this slot */}
                                      <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-sky-200/80 rounded-full" />
                                      <div className="space-y-4">
                                        {activeDaySections.morning.map((item, idx) => {
                                          const isMeal = item.content.toLowerCase().includes("breakfast");
                                          return (
                                            <div key={idx} className="relative pl-8 group">
                                              <div className={`absolute left-1.5 top-4.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center shadow-2xs z-10 transition-all duration-300 group-hover:scale-115 ${
                                                isMeal ? "border-emerald-500 ring-2 ring-emerald-50" : "border-sky-500 ring-2 ring-sky-50"
                                              }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${isMeal ? "bg-emerald-500" : "bg-sky-500"}`} />
                                              </div>
                                              
                                              <div className={`p-3.5 rounded-xl border transition-all duration-300 hover:shadow-sm hover:translate-x-0.5 ${
                                                isMeal ? "border-emerald-100 bg-emerald-50/15 hover:bg-emerald-50/30" : "border-slate-100 bg-slate-50/40 hover:bg-white"
                                              }`}>
                                                {item.time && (
                                                  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider mb-2 border ${
                                                    isMeal ? "bg-emerald-50 text-emerald-700 border-emerald-100/50" : "bg-sky-50 text-sky-700 border-sky-100/50"
                                                  }`}>
                                                    {item.time}
                                                  </span>
                                                )}
                                                <p className="text-xs text-slate-600 leading-relaxed font-semibold">{formatPlanText(item.content)}</p>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* 2. AFTERNOON SECTION */}
                                {activeDaySections.afternoon.length > 0 && (
                                  <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-1.5 pl-1">
                                      <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                                      </svg>
                                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Afternoon (12:00 PM - 05:00 PM)</h4>
                                    </div>
                                    
                                    <div className="relative pl-1">
                                      <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-amber-200/80 rounded-full" />
                                      <div className="space-y-4">
                                        {activeDaySections.afternoon.map((item, idx) => {
                                          const isMeal = item.content.toLowerCase().includes("lunch");
                                          return (
                                            <div key={idx} className="relative pl-8 group">
                                              <div className={`absolute left-1.5 top-4.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center shadow-2xs z-10 transition-all duration-300 group-hover:scale-115 ${
                                                isMeal ? "border-emerald-500 ring-2 ring-emerald-50" : "border-amber-500 ring-2 ring-amber-50"
                                              }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${isMeal ? "bg-emerald-500" : "bg-amber-500"}`} />
                                              </div>
                                              
                                              <div className={`p-3.5 rounded-xl border transition-all duration-300 hover:shadow-sm hover:translate-x-0.5 ${
                                                isMeal ? "border-emerald-100 bg-emerald-50/15 hover:bg-emerald-50/30" : "border-slate-100 bg-slate-50/40 hover:bg-white"
                                              }`}>
                                                {item.time && (
                                                  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider mb-2 border ${
                                                    isMeal ? "bg-emerald-50 text-emerald-700 border-emerald-100/50" : "bg-amber-50 text-amber-700 border-amber-100/50"
                                                  }`}>
                                                    {item.time}
                                                  </span>
                                                )}
                                                <p className="text-xs text-slate-600 leading-relaxed font-semibold">{formatPlanText(item.content)}</p>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* 3. EVENING SECTION */}
                                {activeDaySections.evening.length > 0 && (
                                  <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-1.5 pl-1">
                                      <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                      </svg>
                                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Evening & Dinner (05:00 PM - 10:00 PM)</h4>
                                    </div>
                                    
                                    <div className="relative pl-1">
                                      <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-indigo-200/80 rounded-full" />
                                      <div className="space-y-4">
                                        {activeDaySections.evening.map((item, idx) => {
                                          const isMeal = item.content.toLowerCase().includes("dinner");
                                          return (
                                            <div key={idx} className="relative pl-8 group">
                                              <div className={`absolute left-1.5 top-4.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center shadow-2xs z-10 transition-all duration-300 group-hover:scale-115 ${
                                                isMeal ? "border-emerald-500 ring-2 ring-emerald-50" : "border-indigo-500 ring-2 ring-indigo-50"
                                              }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${isMeal ? "bg-emerald-500" : "bg-indigo-500"}`} />
                                              </div>
                                              
                                              <div className={`p-3.5 rounded-xl border transition-all duration-300 hover:shadow-sm hover:translate-x-0.5 ${
                                                isMeal ? "border-emerald-100 bg-emerald-50/15 hover:bg-emerald-50/30" : "border-slate-100 bg-slate-50/40 hover:bg-white"
                                              }`}>
                                                {item.time && (
                                                  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider mb-2 border ${
                                                    isMeal ? "bg-emerald-50 text-emerald-700 border-emerald-100/50" : "bg-indigo-50 text-indigo-700 border-indigo-100/50"
                                                  }`}>
                                                    {item.time}
                                                  </span>
                                                )}
                                                <p className="text-xs text-slate-600 leading-relaxed font-semibold">{formatPlanText(item.content)}</p>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                )}

                              </div>
                            </div>

                            {/* Interactive Location Map */}
                            <div className="col-span-1 md:col-span-2 overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col h-[280px]">
                              <div className="px-4.5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <svg className="h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  </svg>
                                  <span className="text-xs font-bold text-slate-900">Interactive Location Map</span>
                                </div>
                                <span className="text-[10px] font-semibold text-slate-400">showing active day highlights</span>
                              </div>
                              <div className="flex-1 w-full h-full bg-slate-50 relative">
                                <iframe 
                                  width="100%" 
                                  height="100%" 
                                  style={{ border: 0 }} 
                                  loading="lazy" 
                                  allowFullScreen 
                                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                                    activeDayHighlights.length > 0 
                                      ? `${activeDayHighlights[0]}, ${plannerDestination}` 
                                      : plannerDestination
                                  )}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                                />
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {/* Travel tips */}
                        {summary.tips?.length ? (
                          <div className="rounded-xl sm:rounded-2xl border border-amber-200 bg-amber-50/40 p-4 sm:p-5 space-y-4 w-full">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">💡</span>
                              <h4 className="font-bold text-amber-900 text-sm">Must-Know Travel Tips</h4>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {summary.tips.map((tip, idx) => (
                                <div key={idx} className="flex gap-2.5 rounded-lg sm:rounded-xl bg-white p-3.5 sm:p-4 border border-amber-100 shadow-2xs">
                                  <span className="text-amber-500 font-black">•</span>
                                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">{tip}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 py-16 w-full">
                      <svg className="h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <p className="text-sm font-bold text-slate-700">AI Itinerary Board</p>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-xs font-semibold">
                        Submit the configurations sheet on the left to dynamically generate a custom schedule of route highlights and tips.
                      </p>
                    </div>
                  )}
                </div>
              </section>

            </div>
          </div>
        </div>
      </main>

    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_50%,_#ffffff_100%)] text-slate-900 font-sans">
        <div className="relative flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-sky-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-xs font-bold tracking-wide text-slate-500 uppercase tracking-widest animate-pulse">Loading Planner Content...</p>
        </div>
      </div>
    }>
      <PlannerContent />
    </Suspense>
  );
}
