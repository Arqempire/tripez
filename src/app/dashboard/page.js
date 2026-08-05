"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { LOCATION_DATA, ALL_COUNTRIES } from "@/lib/locations";
import { DESTINATION_PHOTO_MAP, DEFAULT_FALLBACK_PHOTOS, normalizeDestination } from "@/lib/destinations";
import Sidebar from "@/components/Sidebar";

// Inline SVG Icon components for premium aesthetics and zero dependency lag
const LogoIcon = () => (
  <svg className="h-6 w-6 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 12c-2-1.5-4.5-2-6.5-2L10 2H8.5l2 8H5L3.5 8H2.5L4 12l-1.5 4h1L5 14h5.5l-2 8H10l5-8c2 0 4.5-.5 6.5-2z" />
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

const AnalyticsIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const FlightIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 10l-4-8-1 0 2 8-5 0-2-3-1 0 1 5-1 5 1 0 2-3 5 0-2 8 1 0 4-8 5 0c1.5 0 2.5-1 2.5-2s-1-2-2.5-2l-5 0z" />
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

const SettingsIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const UsersIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const TrashIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const PlusIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const HeartIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const NoteIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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

const TRAVEL_PHOTOS = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", // Beach
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80", // Mountains
  "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80", // Paris / City
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80", // Lake / Boats
  "https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1200&q=80", // Snow / Gulmarg
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80", // Travel lake boat
  "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80", // Tropical beach
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80", // Mountain valley landscape
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

const buildTripGallery = (destination) => {
  if (!destination) return DEFAULT_FALLBACK_PHOTOS;

  const normalized = normalizeDestination(destination);
  const searchKey = normalized.toLowerCase();

  // 1. Check exact key in curated destination photo map
  if (DESTINATION_PHOTO_MAP[searchKey] && DESTINATION_PHOTO_MAP[searchKey].length > 0) {
    return DESTINATION_PHOTO_MAP[searchKey];
  }

  // 2. Check partial key match in curated map
  for (const [key, curatedPhotos] of Object.entries(DESTINATION_PHOTO_MAP)) {
    if ((searchKey.includes(key) || key.includes(searchKey)) && curatedPhotos.length > 0) {
      return curatedPhotos;
    }
  }

  // 3. Fallback hash selection
  const indexes = hashStringToIndexes(searchKey, 3, DEFAULT_FALLBACK_PHOTOS.length);
  return indexes.map((idx) => DEFAULT_FALLBACK_PHOTOS[idx]);
};

const buildTripImage = (destination) => {
  const gallery = buildTripGallery(destination);
  return gallery[0] || DEFAULT_FALLBACK_PHOTOS[0];
};

const formatDateRange = (datesStr) => {
  if (!datesStr) return "Dates to be set";
  const match = datesStr.match(/(\d+)\s+days\s+starting\s+([\d-]+)/);
  if (match) {
    const days = match[1];
    const dateObj = new Date(match[2]);
    if (!isNaN(dateObj.getTime())) {
      const options = { month: "short", day: "numeric", year: "numeric" };
      return `${dateObj.toLocaleDateString("en-US", options)} (${days} day${days === "1" ? "" : "s"})`;
    }
  }
  return datesStr;
};



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

const getInitials = (name) => {
  if (!name) return "TE";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0] ? parts[0][0].toUpperCase() : "TE";
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [savingTrip, setSavingTrip] = useState(false);
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [trips, setTrips] = useState([]);
  const [activeTripId, setActiveTripId] = useState(null);
  const [savedTrip, setSavedTrip] = useState(null);
  const [message, setMessage] = useState("");
  const [currentDate] = useState(() => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString("en-US", options);
  });

  const [form, setForm] = useState({
    name: "",
    destination: "",
    startDate: "",
    durationDays: "3",
    travelers: "2",
    interests: "",
    budget: "mid-range",
    style: "balanced",
    notes: "",
  });

  const [selectedCountry, setSelectedCountry] = useState("");
  const [customCountry, setCustomCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [customState, setCustomState] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");
  const [customPlace, setCustomPlace] = useState("");
  const [tripToDelete, setTripToDelete] = useState(null);
  const [tripCreatedSuccessModal, setTripCreatedSuccessModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "ready", "draft"

  const getDestinationString = (cSel, cCust, sSel, sCust, pSel, pCust) => {
    const country = cSel === "custom" ? cCust : cSel;
    const hasData = country && country !== "custom" && Boolean(LOCATION_DATA[country]);

    const state = hasData ? (sSel === "custom" ? sCust : sSel) : (sCust || sSel);
    const place = hasData ? (pSel === "custom" ? pCust : pSel) : (pCust || pSel);

    const parts = [place, state, country].map(s => (s || "").trim()).filter(Boolean);
    return parts.join(", ");
  };

  const syncDestinationString = (cSel, cCust, sSel, sCust, pSel, pCust) => {
    const str = getDestinationString(cSel, cCust, sSel, sCust, pSel, pCust);
    setForm((current) => ({ ...current, destination: str }));
  };

  const handleCountrySelect = (value) => {
    setSelectedCountry(value);
    setSelectedState("");
    setCustomState("");
    setSelectedPlace("");
    setCustomPlace("");
    syncDestinationString(value, customCountry, "", "", "", "");
  };

  const handleCustomCountryChange = (val) => {
    setCustomCountry(val);
    syncDestinationString(selectedCountry, val, selectedState, customState, selectedPlace, customPlace);
  };

  const handleStateSelect = (value) => {
    setSelectedState(value);
    setSelectedPlace("");
    setCustomPlace("");
    syncDestinationString(selectedCountry, customCountry, value, customState, "", "");
  };

  const handleCustomStateChange = (val) => {
    setCustomState(val);
    syncDestinationString(selectedCountry, customCountry, selectedState, val, selectedPlace, customPlace);
  };

  const handlePlaceSelect = (value) => {
    setSelectedPlace(value);
    syncDestinationString(selectedCountry, customCountry, selectedState, customState, value, customPlace);
  };

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchesSearch =
        !searchQuery.trim() ||
        (trip.name && trip.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (trip.destination && trip.destination.toLowerCase().includes(searchQuery.toLowerCase()));

      const isReady = Boolean(trip.itinerary);
      if (statusFilter === "ready") return matchesSearch && isReady;
      if (statusFilter === "draft") return matchesSearch && !isReady;
      return matchesSearch;
    });
  }, [trips, searchQuery, statusFilter]);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      if (!supabase) {
        router.replace("/login");
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

      const profileName = session.user?.user_metadata?.full_name || session.user?.email || "your account";
      setUserId(session.user.id);
      setUserName(profileName);
      setUserEmail(session.user?.email || "");

      const { data: savedTrips, error } = await supabase
        .from("trips")
        .select("id, name, destination, dates, travelers, interests, notes, image, gallery, created_at, itinerary")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) {
        setMessage("We couldn't load your saved trips. Please try refreshing.");
      } else {
        setTrips(savedTrips || []);
      }

      setLoading(false);
    };

    loadSession();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateTrip = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setMessage("Please enter a trip name.");
      return;
    }
    if (!form.destination.trim()) {
      setMessage("Please select a destination.");
      return;
    }
    if (!form.startDate) {
      setMessage("Please select a start date.");
      return;
    }
    if (!form.durationDays || Number(form.durationDays) < 1) {
      setMessage("Please enter a valid duration (at least 1 day).");
      return;
    }
    if (!form.travelers || Number(form.travelers) < 1) {
      setMessage("Please enter traveler count.");
      return;
    }

    if (!supabase || !userId) {
      setMessage("Please sign in again before saving a trip.");
      return;
    }

    const destination = form.destination.trim();
    if (!destination || destination === ", ,") {
      setMessage("Please select or enter a valid destination.");
      return;
    }

    const dates = `${form.durationDays} days starting ${form.startDate}`;
    const finalInterests = form.interests.trim() || "Sightseeing, local culture, food & scenic spots";

    const basePayload = {
      user_id: userId,
      name: form.name.trim(),
      destination,
      dates,
      travelers: Number(form.travelers) || 1,
      interests: finalInterests,
      notes: form.notes.trim(),
      image: buildTripImage(destination),
      gallery: buildTripGallery(destination),
    };

    setSavingTrip(true);
    setMessage("");

    let savedTrip = null;
    let insertError = null;

    // Try inserting payload with optional budget and style columns
    const fullPayload = {
      ...basePayload,
      budget: form.budget || "mid-range",
      style: form.style || "balanced",
    };

    const res1 = await supabase
      .from("trips")
      .insert(fullPayload)
      .select("id, name, destination, dates, travelers, interests, notes, image, gallery, created_at, itinerary")
      .single();

    if (res1.error) {
      console.warn("Supabase insert with optional columns failed, retrying base payload:", res1.error.message);
      // Fallback: retry with standard columns only
      const res2 = await supabase
        .from("trips")
        .insert(basePayload)
        .select("id, name, destination, dates, travelers, interests, notes, image, gallery, created_at, itinerary")
        .single();

      savedTrip = res2.data;
      insertError = res2.error;
    } else {
      savedTrip = res1.data;
    }

    setSavingTrip(false);

    if (insertError || !savedTrip) {
      const errMsg = insertError ? insertError.message : "Unknown database error.";
      console.error("Failed to save trip to Supabase:", insertError);
      setMessage(`We couldn't save this trip: ${errMsg}`);
      return;
    }

    setTrips((currentTrips) => [savedTrip, ...currentTrips]);
    setSavedTrip(savedTrip);
    setTripCreatedSuccessModal(savedTrip);

    setForm({
      name: "",
      destination: "",
      startDate: "",
      durationDays: "3",
      travelers: "2",
      interests: "",
      budget: "mid-range",
      style: "balanced",
      notes: "",
    });
    setSelectedCountry("");
    setCustomCountry("");
    setSelectedState("");
    setCustomState("");
    setSelectedPlace("");
    setCustomPlace("");
    setMessage("Trip created. You can generate an itinerary for it now.");
  };

  const handleDeleteTrip = (tripId, tripName) => {
    setTripToDelete({ id: tripId, name: tripName });
  };

  const confirmDeleteTrip = async () => {
    if (!tripToDelete) return;
    const { id: tripId, name: tripName } = tripToDelete;
    setTripToDelete(null);

    try {
      const { error } = await supabase
        .from("trips")
        .delete()
        .eq("id", tripId);

      if (error) {
        throw error;
      }

      setTrips((currentTrips) => currentTrips.filter((t) => t.id !== tripId));
      setMessage(`Trip "${tripName}" deleted successfully.`);
    } catch (error) {
      setMessage(`Unable to delete trip: ${error.message}`);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_50%,_#ffffff_100%)] text-slate-900">
        <div className="relative flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-sky-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-xs font-bold tracking-wide text-slate-500 uppercase tracking-widest animate-pulse">Preparing your dashboard...</p>
        </div>
      </div>
    );
  }

  const countryHasData = selectedCountry && selectedCountry !== "custom" && Boolean(LOCATION_DATA[selectedCountry]);

  return (
    <div className="flex min-h-screen bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_50%,_#ffffff_100%)] text-slate-900 font-sans antialiased">

      {/* SUCCESS OVERLAY MODAL */}
      {savedTrip ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm px-4 animate-fade-in">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="trip-saved-title"
            className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-2xl animate-scale-up"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl text-emerald-600 shadow-inner">
              ✓
            </div>
            <h2 id="trip-saved-title" className="mt-5 text-2xl font-bold text-slate-900">
              Trip Saved Successfully!
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              <strong>{savedTrip.name}</strong> has been added to your adventure board.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setSavedTrip(null)}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-5 py-3 font-semibold text-slate-700 text-sm transition"
              >
                Close
              </button>
              <Link
                href={`/planner?tripId=${encodeURIComponent(savedTrip.id)}`}
                className="flex-1 rounded-2xl bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 px-5 py-3 font-semibold text-white text-sm transition text-center shadow-md shadow-sky-100 flex items-center justify-center gap-1.5"
              >
                Plan Itinerary
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {/* DELETE CONFIRMATION OVERLAY MODAL */}
      {tripToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm px-4 animate-fade-in">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="trip-delete-title"
            className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-2xl animate-scale-up"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-3xl text-rose-600 shadow-inner">
              ⚠️
            </div>
            <h2 id="trip-delete-title" className="mt-5 text-2xl font-bold text-slate-900">
              Delete Trip?
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Are you sure you want to delete <strong>{tripToDelete.name}</strong>? All generated itineraries and metadata will be permanently erased.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setTripToDelete(null)}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-5 py-3 font-semibold text-slate-700 text-sm transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteTrip}
                className="flex-1 rounded-2xl bg-rose-600 hover:bg-rose-700 px-5 py-3 font-semibold text-white text-sm transition shadow-md shadow-rose-100"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* REUSABLE SIDEBAR & MOBILE NAVIGATION */}
      <Sidebar
        userName={userName}
        handleSignOut={handleSignOut}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 min-h-screen pt-6 md:pt-0 pb-24 md:pb-8 transition-all duration-300 ${isSidebarCollapsed ? "md:pl-20" : "md:pl-64"}`}>
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-8 sm:py-10 space-y-8">

          {/* Greeting Header & User Profile Dropdown */}
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200/60">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-sky-700">{currentDate}</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1 tracking-tight">Welcome back, {userName} 👋</h1>
            </div>

            {/* TOP RIGHT USER PROFILE ICON & DROPDOWN */}
            <div className="relative self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 shadow-md shadow-slate-200/50 hover:shadow-lg hover:border-sky-300 transition-all duration-200 cursor-pointer group"
                title="Account & Profile"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-xs font-bold text-white shadow-xs group-hover:scale-105 transition-transform">
                  {getInitials(userName)}
                </div>
                <svg className={`h-4 w-4 text-slate-500 mr-1.5 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 rounded-3xl border border-slate-200/90 bg-white p-3 shadow-2xl shadow-slate-300/60 z-50 animate-scale-up backdrop-blur-md">
                    {/* User Card */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-sm font-bold text-white shadow-md">
                        {getInitials(userName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-extrabold text-slate-900 truncate" title={userName}>{userName}</p>
                        <p className="text-[11px] text-slate-500 truncate" title={userEmail}>{userEmail || "Signed in"}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-700 tracking-wider">Active</span>
                      </div>
                    </div>

                    <div className="space-y-1 font-sans">
                      <Link
                        href="/settings"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all"
                      >
                        <SettingsIcon />
                        Account Settings
                      </Link>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => { setIsProfileMenuOpen(false); handleSignOut(); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                      >
                        <LogoutIcon />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </header>

          {/* Quick Tools Banner */}
          <section className="space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-700 px-1">Quick Tools & Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
              <Link href="/flights" className="h-24 group rounded-3xl border border-slate-200/90 bg-white px-5 py-4 shadow-md shadow-slate-200/50 hover:shadow-xl hover:shadow-sky-200/60 hover:border-sky-400 hover:bg-sky-50/40 transition-all duration-300 ease-out transform hover:-translate-y-1.5 flex items-center min-w-0">
                <div className="flex items-center gap-4 min-w-0 w-full">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 group-hover:bg-sky-100 group-hover:border-sky-200 group-hover:scale-110 transition-all duration-300 shadow-xs">
                    <FlightIcon />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors truncate">Flight Search</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">Google Flights fares</p>
                  </div>
                </div>
              </Link>

              <Link href="/analytics" className="h-24 group rounded-3xl border border-slate-200/90 bg-white px-5 py-4 shadow-md shadow-slate-200/50 hover:shadow-xl hover:shadow-emerald-200/60 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all duration-300 ease-out transform hover:-translate-y-1.5 flex items-center min-w-0">
                <div className="flex items-center gap-4 min-w-0 w-full">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 group-hover:bg-emerald-100 group-hover:border-emerald-200 group-hover:scale-110 transition-all duration-300 shadow-xs">
                    <AnalyticsIcon />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">Travel Analytics</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">AI activity & trip stats</p>
                  </div>
                </div>
              </Link>

              <Link href="/documents" className="h-24 group rounded-3xl border border-slate-200/90 bg-white px-5 py-4 shadow-md shadow-slate-200/50 hover:shadow-xl hover:shadow-sky-200/60 hover:border-sky-400 hover:bg-sky-50/40 transition-all duration-300 ease-out transform hover:-translate-y-1.5 flex items-center min-w-0">
                <div className="flex items-center gap-4 min-w-0 w-full">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 group-hover:bg-sky-100 group-hover:border-sky-200 group-hover:scale-110 transition-all duration-300 shadow-xs">
                    <DocumentIcon />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors truncate">Document Vault</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">Store booking files</p>
                  </div>
                </div>
              </Link>

              <Link href="/expenses" className="h-24 group rounded-3xl border border-slate-200/90 bg-white px-5 py-4 shadow-md shadow-slate-200/50 hover:shadow-xl hover:shadow-amber-200/60 hover:border-amber-400 hover:bg-amber-50/40 transition-all duration-300 ease-out transform hover:-translate-y-1.5 flex items-center min-w-0">
                <div className="flex items-center gap-4 min-w-0 w-full">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 group-hover:bg-amber-100 group-hover:border-amber-200 group-hover:scale-110 transition-all duration-300 shadow-xs">
                    <ExpenseIcon />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors truncate">Expense Tracker</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">Track budgets & spending</p>
                  </div>
                </div>
              </Link>

              <Link href="/trip-collab" className="h-24 group rounded-3xl border border-slate-200/90 bg-white px-5 py-4 shadow-md shadow-slate-200/50 hover:shadow-xl hover:shadow-violet-200/60 hover:border-violet-400 hover:bg-violet-50/40 transition-all duration-300 ease-out transform hover:-translate-y-1.5 flex items-center min-w-0">
                <div className="flex items-center gap-4 min-w-0 w-full">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 border border-violet-100 text-violet-600 group-hover:bg-violet-100 group-hover:border-violet-200 group-hover:scale-110 transition-all duration-300 shadow-xs">
                    <CollabIcon />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-violet-700 transition-colors truncate">Trip Collaboration</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">Invite friends & share</p>
                  </div>
                </div>
              </Link>
            </div>
          </section>

          {/* Primary Action Columns */}
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] items-start">

            {/* LEFT COLUMN: Create a Trip Form */}
            <section className="space-y-6">
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xl shadow-slate-200/60 backdrop-blur-md space-y-5 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-300/40">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Plan a New Trip</h2>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">Specify destination and preferences to launch your AI assistant.</p>
                  </div>
                  <span className="shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 border border-sky-100 text-sky-600 shadow-xs">
                    <PlusIcon />
                  </span>
                </div>

                {message ? (
                  <div className="rounded-2xl bg-sky-50 border border-sky-200 px-4 py-3 text-xs font-semibold text-sky-800 flex items-start gap-2.5 animate-fade-in shadow-xs">
                    <svg className="h-4 w-4 shrink-0 text-sky-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{message}</span>
                  </div>
                ) : null}

                <form onSubmit={handleCreateTrip} className="space-y-4">
                  {/* Trip Name */}
                  <div className="relative">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1 block">Trip Name</label>
                    <div className="relative rounded-2xl border border-slate-300 bg-slate-100/90 hover:bg-slate-100 hover:border-slate-400 focus-within:bg-white focus-within:border-sky-600 focus-within:ring-2 focus-within:ring-sky-200 transition-all duration-200 shadow-xs">
                      <span className="absolute left-3.5 top-3 text-slate-500">
                        <NoteIcon />
                      </span>
                      <input
                        value={form.name}
                        onChange={(event) => setForm({ ...form, name: event.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder-slate-500"
                        placeholder="e.g. Winter in Kashmir"
                      />
                    </div>
                  </div>

                  {/* Destination Panel */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">Destination</label>

                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                      {/* Country Select */}
                      <div className="relative rounded-2xl border border-slate-300 bg-slate-100/90 hover:bg-slate-100 hover:border-slate-400 focus-within:bg-white focus-within:border-sky-600 focus-within:ring-2 focus-within:ring-sky-200 transition-all duration-200 shadow-xs col-span-1 sm:col-span-2">
                        <span className="absolute left-3.5 top-3 text-slate-500">
                          <MapPinIcon />
                        </span>
                        <select
                          value={selectedCountry}
                          onChange={(event) => handleCountrySelect(event.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 bg-transparent text-sm font-semibold text-slate-900 outline-none appearance-none cursor-pointer placeholder-slate-500"
                        >
                          <option value="">Select Country...</option>
                          {ALL_COUNTRIES.map((country) => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                        <span className="absolute right-3.5 top-3 text-slate-500 pointer-events-none">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </div>

                      {/* State Select / Custom input */}
                      {selectedCountry && (
                        countryHasData ? (
                          <>
                            <div className="relative rounded-2xl border border-slate-300 bg-slate-100/90 hover:bg-slate-100 hover:border-slate-400 focus-within:bg-white focus-within:border-sky-600 focus-within:ring-2 focus-within:ring-sky-200 transition-all duration-200 shadow-xs">
                              <span className="absolute left-3.5 top-3 text-slate-500">
                                <MapPinIcon />
                              </span>
                              <select
                                value={selectedState}
                                onChange={(event) => handleStateSelect(event.target.value)}
                                className="w-full pl-10 pr-8 py-2.5 bg-transparent text-xs sm:text-sm font-semibold text-slate-900 outline-none appearance-none cursor-pointer"
                              >
                                <option value="">Select State/Region...</option>
                                {Object.keys(LOCATION_DATA[selectedCountry] || {}).map((state) => (
                                  <option key={state} value={state}>{state}</option>
                                ))}
                                <option value="custom">Other / Custom...</option>
                              </select>
                              <span className="absolute right-3 top-3 text-slate-500 pointer-events-none">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                              </span>
                            </div>

                            {selectedState === "custom" && (
                              <div className="relative rounded-2xl border border-slate-300 bg-slate-100/90 hover:bg-slate-100 hover:border-slate-400 focus-within:bg-white focus-within:border-sky-600 focus-within:ring-2 focus-within:ring-sky-200 transition-all duration-200 shadow-xs">
                                <span className="absolute left-3.5 top-3 text-slate-500">
                                  <MapPinIcon />
                                </span>
                                <input
                                  value={customState}
                                  onChange={(event) => handleCustomStateChange(event.target.value)}
                                  className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder-slate-500"
                                  placeholder="Custom state..."
                                />
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="relative rounded-2xl border border-slate-300 bg-slate-100/90 hover:bg-slate-100 hover:border-slate-400 focus-within:bg-white focus-within:border-sky-600 focus-within:ring-2 focus-within:ring-sky-200 transition-all duration-200 shadow-xs col-span-1 sm:col-span-2">
                            <span className="absolute left-3.5 top-3 text-slate-500">
                              <MapPinIcon />
                            </span>
                            <input
                              value={customState}
                              onChange={(event) => handleCustomStateChange(event.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder-slate-500"
                              placeholder="State or region (optional)..."
                            />
                          </div>
                        )
                      )}

                      {/* Place Select / Custom input */}
                      {selectedCountry && (
                        countryHasData ? (
                          selectedState && (
                            <>
                              <div className="relative rounded-2xl border border-slate-300 bg-slate-100/90 hover:bg-slate-100 hover:border-slate-400 focus-within:bg-white focus-within:border-sky-600 focus-within:ring-2 focus-within:ring-sky-200 transition-all duration-200 shadow-xs">
                                <span className="absolute left-3.5 top-3 text-slate-500">
                                  <MapPinIcon />
                                </span>
                                <select
                                  value={selectedPlace}
                                  onChange={(event) => handlePlaceSelect(event.target.value)}
                                  className="w-full pl-10 pr-8 py-2.5 bg-transparent text-xs sm:text-sm font-semibold text-slate-900 outline-none appearance-none cursor-pointer"
                                >
                                  <option value="">Select Place...</option>
                                  {(LOCATION_DATA[selectedCountry]?.[selectedState] || []).map((place) => (
                                    <option key={place} value={place}>{place}</option>
                                  ))}
                                  <option value="custom">Other / Custom...</option>
                                </select>
                                <span className="absolute right-3 top-3 text-slate-500 pointer-events-none">
                                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                  </svg>
                                </span>
                              </div>

                              {selectedPlace === "custom" && (
                                <div className="relative rounded-2xl border border-slate-300 bg-slate-100/90 hover:bg-slate-100 hover:border-slate-400 focus-within:bg-white focus-within:border-sky-600 focus-within:ring-2 focus-within:ring-sky-200 transition-all duration-200 shadow-xs">
                                  <span className="absolute left-3.5 top-3 text-slate-500">
                                    <MapPinIcon />
                                  </span>
                                  <input
                                    value={customPlace}
                                    onChange={(event) => handleCustomPlaceChange(event.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder-slate-500"
                                    placeholder="Custom place..."
                                  />
                                </div>
                              )}
                            </>
                          )
                        ) : (
                          <div className="relative rounded-2xl border border-slate-300 bg-slate-100/90 hover:bg-slate-100 hover:border-slate-400 focus-within:bg-white focus-within:border-sky-600 focus-within:ring-2 focus-within:ring-sky-200 transition-all duration-200 shadow-xs col-span-1 sm:col-span-2">
                            <span className="absolute left-3.5 top-3 text-slate-500">
                              <MapPinIcon />
                            </span>
                            <input
                              value={customPlace}
                              onChange={(event) => handleCustomPlaceChange(event.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder-slate-500"
                              placeholder="City or place..."
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Date, Duration, Travelers Grid */}
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                    {/* Start Date */}
                    <div className="relative">
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1 block">Start Date</label>
                      <div className="relative rounded-2xl border border-slate-300 bg-slate-100/90 hover:bg-slate-100 hover:border-slate-400 focus-within:bg-white focus-within:border-sky-600 focus-within:ring-2 focus-within:ring-sky-200 transition-all duration-200 shadow-xs">
                        <span className="absolute left-3 top-2.5 text-slate-500">
                          <CalendarIcon />
                        </span>
                        <input
                          type="date"
                          value={form.startDate}
                          onChange={(event) => setForm({ ...form, startDate: event.target.value })}
                          className="w-full pl-9 pr-3 py-2 bg-transparent text-xs font-semibold text-slate-900 outline-none"
                        />
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="relative">
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1 block">Days</label>
                      <div className="relative rounded-2xl border border-slate-300 bg-slate-100/90 hover:bg-slate-100 hover:border-slate-400 focus-within:bg-white focus-within:border-sky-600 focus-within:ring-2 focus-within:ring-sky-200 transition-all duration-200 shadow-xs">
                        <span className="absolute left-3 top-2.5 text-slate-500">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                        <input
                          type="number"
                          min="1"
                          value={form.durationDays}
                          onChange={(event) => setForm({ ...form, durationDays: event.target.value })}
                          className="w-full pl-9 pr-3 py-2 bg-transparent text-xs font-semibold text-slate-900 outline-none"
                        />
                      </div>
                    </div>

                    {/* Travelers */}
                    <div className="relative">
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1 block">Travelers</label>
                      <div className="relative rounded-2xl border border-slate-300 bg-slate-100/90 hover:bg-slate-100 hover:border-slate-400 focus-within:bg-white focus-within:border-sky-600 focus-within:ring-2 focus-within:ring-sky-200 transition-all duration-200 shadow-xs">
                        <span className="absolute left-3 top-2.5 text-slate-500">
                          <UsersIcon />
                        </span>
                        <input
                          type="number"
                          min="1"
                          value={form.travelers}
                          onChange={(event) => setForm({ ...form, travelers: event.target.value })}
                          className="w-full pl-9 pr-3 py-2 bg-transparent text-xs font-semibold text-slate-900 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Budget & Style */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="relative">
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1 block">Budget</label>
                      <div className="relative rounded-2xl border border-slate-300 bg-slate-100/90 hover:bg-slate-100 hover:border-slate-400 focus-within:bg-white focus-within:border-sky-600 focus-within:ring-2 focus-within:ring-sky-200 transition-all duration-200 shadow-xs">
                        <select
                          value={form.budget}
                          onChange={(event) => setForm({ ...form, budget: event.target.value })}
                          className="w-full px-3 py-2 bg-transparent text-xs font-semibold text-slate-900 outline-none appearance-none cursor-pointer"
                        >
                          <option value="budget">Budget</option>
                          <option value="mid-range">Mid-range</option>
                          <option value="luxury">Luxury</option>
                        </select>
                      </div>
                    </div>

                    <div className="relative">
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1 block">Travel Pace</label>
                      <div className="relative rounded-2xl border border-slate-300 bg-slate-100/90 hover:bg-slate-100 hover:border-slate-400 focus-within:bg-white focus-within:border-sky-600 focus-within:ring-2 focus-within:ring-sky-200 transition-all duration-200 shadow-xs">
                        <select
                          value={form.style}
                          onChange={(event) => setForm({ ...form, style: event.target.value })}
                          className="w-full px-3 py-2 bg-transparent text-xs font-semibold text-slate-900 outline-none appearance-none cursor-pointer"
                        >
                          <option value="relaxed">Relaxed</option>
                          <option value="balanced">Balanced</option>
                          <option value="packed">Packed / Fast</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Interests */}
                  <div className="relative">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1 block">Interests & Vibes <span className="text-slate-500 font-medium lowercase">(optional)</span></label>
                    <div className="relative rounded-2xl border border-slate-300 bg-slate-100/90 hover:bg-slate-100 hover:border-slate-400 focus-within:bg-white focus-within:border-sky-600 focus-within:ring-2 focus-within:ring-sky-200 transition-all duration-200 shadow-xs">
                      <span className="absolute left-3.5 top-3 text-slate-500">
                        <HeartIcon />
                      </span>
                      <input
                        value={form.interests}
                        onChange={(event) => setForm({ ...form, interests: event.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder-slate-500"
                        placeholder="e.g. food, beaches, historic walks"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="relative">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1 block">Notes</label>
                    <div className="relative rounded-2xl border border-slate-300 bg-slate-100/90 hover:bg-slate-100 hover:border-slate-400 focus-within:bg-white focus-within:border-sky-600 focus-within:ring-2 focus-within:ring-sky-200 transition-all duration-200 shadow-xs">
                      <textarea
                        value={form.notes}
                        onChange={(event) => setForm({ ...form, notes: event.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 bg-transparent text-xs font-semibold text-slate-900 outline-none placeholder-slate-500 resize-none"
                        placeholder="Any budget restrictions, accommodations, or special highlights..."
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={savingTrip}
                    className="w-full relative overflow-hidden flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-200/80 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-75 disabled:pointer-events-none transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    {savingTrip ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving trip...
                      </>
                    ) : (
                      <>
                        <PlusIcon />
                        Save Trip
                      </>
                    )}
                  </button>
                </form>
              </div>
            </section>

            {/* RIGHT COLUMN: Your Trips Feed with Search & Filter */}
            <section className="space-y-5">
              {/* Header & Filter Controls */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-md shadow-slate-200/40 backdrop-blur-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                      Saved Trips
                      <span className="bg-sky-50 border border-sky-100 text-sky-700 px-2.5 py-0.5 rounded-full text-xs font-extrabold shadow-xs">
                        {trips.length}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">Manage and view trip itineraries below.</p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 text-xs font-semibold self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setStatusFilter("all")}
                      className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${statusFilter === "all" ? "bg-white text-slate-900 shadow-xs font-extrabold" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      All ({trips.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("ready")}
                      className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${statusFilter === "ready" ? "bg-white text-emerald-700 shadow-xs font-extrabold" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      Ready ({trips.filter(t => t.itinerary).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("draft")}
                      className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${statusFilter === "draft" ? "bg-white text-sky-700 shadow-xs font-extrabold" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      Drafts ({trips.filter(t => !t.itinerary).length})
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                {trips.length > 0 && (
                  <div className="relative rounded-2xl border border-slate-300 bg-slate-100/90 hover:bg-slate-100 focus-within:bg-white focus-within:border-sky-600 focus-within:ring-2 focus-within:ring-sky-200 transition-all duration-200 shadow-xs">
                    <span className="absolute left-3.5 top-2.5 text-slate-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search saved trips by name or location..."
                      className="w-full pl-10 pr-8 py-2 text-xs font-semibold text-slate-900 bg-transparent outline-none placeholder-slate-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <CloseIcon />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Feed Content Area with Scroll Container */}
              {(() => {
                if (trips.length === 0) {
                  return (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/90 p-8 text-center text-slate-500 backdrop-blur-md shadow-sm">
                      <svg className="h-10 w-10 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <p className="text-sm font-semibold text-slate-700">No saved trips yet</p>
                      <p className="text-xs text-slate-400 mt-1">Fill out the planner form on the left to start.</p>
                    </div>
                  );
                }

                if (filteredTrips.length === 0) {
                  return (
                    <div className="rounded-3xl border border-slate-200/90 bg-white p-8 text-center text-slate-500 backdrop-blur-md shadow-md shadow-slate-200/40">
                      <p className="text-sm font-bold text-slate-700">No matching trips found</p>
                      <p className="text-xs text-slate-400 mt-1">Try clearing your search query or switching filters.</p>
                      <button
                        onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
                        className="mt-4 text-xs font-bold text-sky-600 hover:text-sky-700 underline cursor-pointer"
                      >
                        Reset filters
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4 max-h-[750px] overflow-y-auto pr-1">
                    {filteredTrips.map((trip) => {
                      const isExpanded = activeTripId === trip.id;
                      const coverImage = buildTripImage(trip.destination);
                      const gallery = buildTripGallery(trip.destination);
                      const travelerCount = String(trip.travelers || "1");

                      return (
                        <div
                          key={trip.id}
                          className="group overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-md shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/60 hover:border-sky-300 hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col cursor-pointer"
                        >
                          {/* Clickable Header Banner */}
                          <div
                            className="cursor-pointer relative overflow-hidden"
                            onClick={() => setActiveTripId(isExpanded ? null : trip.id)}
                          >
                            <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                              <Image
                                src={coverImage}
                                alt={trip.name || trip.destination || "Trip destination"}
                                fill
                                sizes="(max-width: 1024px) 100vw, 45vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />

                              {/* Itinerary Status Overlay */}
                              <div className="absolute top-3 right-3">
                                {trip.itinerary ? (
                                  <span className="backdrop-blur-md bg-emerald-500/90 text-white text-[11px] px-2.5 py-1 rounded-full font-semibold border border-emerald-400/20 flex items-center gap-1 shadow-xs">
                                    ✓ Ready
                                  </span>
                                ) : (
                                  <span className="backdrop-blur-md bg-slate-900/80 text-slate-200 text-[11px] px-2.5 py-1 rounded-full font-semibold border border-slate-700/30 flex items-center gap-1 shadow-xs">
                                    ⚡ Draft
                                  </span>
                                )}
                              </div>

                              {/* Title and Destination Texts */}
                              <div className="absolute bottom-3 left-4 right-4">
                                <h3 className="text-base sm:text-lg font-extrabold text-white tracking-wide truncate">{trip.name}</h3>
                                <p className="text-xs text-slate-200/95 font-medium mt-0.5 flex items-center gap-1 truncate">
                                  <span className="opacity-80"><MapPinIcon /></span>
                                  {formatDestinationDisplay(trip.destination)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Content Area */}
                          <div className="p-4 space-y-3">
                            {/* Calendar & Travelers Metabar */}
                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                              <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1 text-[11px]">
                                <span className="text-slate-400"><CalendarIcon /></span>
                                {formatDateRange(trip.dates)}
                              </span>
                              <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1 text-[11px]">
                                <span className="text-slate-400"><UsersIcon /></span>
                                {travelerCount} traveler{travelerCount === "1" ? "" : "s"}
                              </span>
                            </div>

                            {/* Interests section */}
                            {trip.interests && (
                              <div className="flex items-start gap-1.5 text-xs text-slate-500 bg-slate-50/60 rounded-xl p-2.5 border border-slate-100">
                                <span className="text-rose-400 shrink-0 mt-0.5"><HeartIcon /></span>
                                <span className="line-clamp-1 text-[11px]"><strong>Interests:</strong> {trip.interests}</span>
                              </div>
                            )}

                            {/* Action Items Footer */}
                            <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
                              <Link
                                href={`/planner?tripId=${encodeURIComponent(trip.id)}`}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-center rounded-xl text-xs font-bold transition ${trip.itinerary
                                  ? "bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
                                  : "bg-sky-600 hover:bg-sky-700 text-white shadow-sm shadow-sky-100"
                                  }`}
                                onClick={(event) => event.stopPropagation()}
                              >
                                {trip.itinerary ? "Explore Itinerary" : "Plan Trip"}
                              </Link>

                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleDeleteTrip(trip.id, trip.name);
                                }}
                                className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all cursor-pointer"
                                title="Delete Trip"
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          </div>

                          {/* Collapsible Photo Gallery */}
                          {isExpanded ? (
                            <div className="border-t border-slate-100 bg-slate-50/40 p-4 space-y-2.5 animate-fade-in">
                              <div className="flex items-center justify-between">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Highlights</p>
                                <button
                                  onClick={() => setActiveTripId(null)}
                                  className="text-[10px] font-bold uppercase tracking-widest text-sky-600 hover:text-sky-700 transition cursor-pointer"
                                >
                                  Hide Gallery
                                </button>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                {gallery.map((image, index) => (
                                  <div
                                    key={`${trip.id}-${index}`}
                                    className="relative h-16 overflow-hidden rounded-xl group/img border border-slate-200/50 shadow-inner"
                                  >
                                    <Image
                                      src={image}
                                      alt={`${trip.destination} view ${index + 1}`}
                                      fill
                                      sizes="(max-width: 640px) 33vw, 15vw"
                                      className="object-cover group-hover/img:scale-110 transition-transform duration-300"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </section>
          </div>
        </div>
      </main>

      {/* Trip Created Success Confirmation Dialog Modal */}
      {tripCreatedSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-[2.5rem] border border-emerald-100 bg-white/95 p-8 shadow-2xl backdrop-blur-md text-center space-y-6 animate-scale-up">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-md shadow-emerald-100/50">
              <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                Trip Created Successfully!
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight pt-1">
                {tripCreatedSuccessModal.name}
              </h3>
              <p className="text-xs text-slate-500 font-semibold flex items-center justify-center gap-1">
                <MapPinIcon /> {formatDestinationDisplay(tripCreatedSuccessModal.destination)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-xs font-semibold text-slate-600 text-left space-y-2">
              <div className="flex justify-between border-b border-slate-200/50 pb-2">
                <span className="text-slate-400">Timeline:</span>
                <span className="text-slate-800 font-bold">{formatDateRange(tripCreatedSuccessModal.dates)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/50 pb-2">
                <span className="text-slate-400">Travelers:</span>
                <span className="text-slate-800 font-bold">{tripCreatedSuccessModal.travelers} traveler(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Interests:</span>
                <span className="text-slate-800 font-bold truncate max-w-[200px]" title={tripCreatedSuccessModal.interests}>
                  {tripCreatedSuccessModal.interests}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  const id = tripCreatedSuccessModal.id;
                  setTripCreatedSuccessModal(null);
                  router.push(`/planner?tripId=${encodeURIComponent(id)}&autoGenerate=true`);
                }}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-100 transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Launch AI Planner Now</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => setTripCreatedSuccessModal(null)}
                className="w-full rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 py-3 text-xs font-bold text-slate-700 transition cursor-pointer"
              >
                View Saved Trips
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
