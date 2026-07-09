"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

// Inline SVG Icon components for premium aesthetics and zero dependency lag
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

const buildTripGallery = (destination) => {
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

  const indexes = hashStringToIndexes(lowerDestination, 3, TRAVEL_PHOTOS.length);
  return indexes.map(idx => TRAVEL_PHOTOS[idx]);
};

const buildTripImage = (destination) => buildTripGallery(destination)[0];

const sanitizeImageUrl = (url, destination = "travel", index = 1) => {
  if (!url) return "";
  if (url.includes("source.unsplash.com")) {
    const gallery = buildTripGallery(destination);
    return gallery[(index - 1) % gallery.length] || gallery[0];
  }
  return url;
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

const LOCATION_DATA = {
  "India": {
    "Jammu & Kashmir": ["Srinagar", "Gulmarg", "Pahalgam", "Sonamarg", "Leh Ladakh"],
    "Delhi": ["New Delhi", "Old Delhi", "Connaught Place"],
    "Maharashtra": ["Mumbai", "Pune", "Lonavala", "Mahabaleshwar"],
    "Karnataka": ["Bengaluru", "Mysuru", "Coorg", "Hampi"]
  },
  "Japan": {
    "Kanto": ["Tokyo", "Yokohama", "Hakone", "Kamakura"],
    "Kansai": ["Kyoto", "Osaka", "Nara", "Kobe"],
    "Hokkaido": ["Sapporo", "Otaru", "Hakodate", "Niseko"]
  },
  "United States of America": {
    "New York": ["New York City", "Buffalo", "Rochester", "Ithaca"],
    "California": ["San Francisco", "Los Angeles", "San Diego", "Yosemite"],
    "Florida": ["Miami", "Orlando", "Key West", "Tampa"]
  },
  "France": {
    "Île-de-France": ["Paris", "Versailles", "Fontainebleau"],
    "Provence-Alpes-Côte d'Azur": ["Nice", "Marseille", "Cannes", "Aix-en-Provence"],
    "Auvergne-Rhône-Alpes": ["Lyon", "Chamonix", "Annecy"]
  },
  "United Kingdom": {
    "England": ["London", "Bath", "Oxford", "Cambridge", "Manchester"],
    "Scotland": ["Edinburgh", "Glasgow", "Inverness", "Isle of Skye"],
    "Wales": ["Cardiff", "Snowdonia", "Conwy"]
  }
};

const ALL_COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
  "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
  "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq",
  "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait",
  "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
  "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (Burma)", "Namibia", "Nauru",
  "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman",
  "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
  "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
  "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela",
  "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

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
  const [trips, setTrips] = useState([]);
  const [activeTripId, setActiveTripId] = useState(null);
  const [savedTrip, setSavedTrip] = useState(null);
  const [message, setMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  
  const [form, setForm] = useState({
    name: "",
    destination: "",
    startDate: "",
    durationDays: "3",
    travelers: "2",
    interests: "",
    notes: "",
  });
  
  const [selectedCountry, setSelectedCountry] = useState("");
  const [customCountry, setCustomCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [customState, setCustomState] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");
  const [customPlace, setCustomPlace] = useState("");
  const [tripToDelete, setTripToDelete] = useState(null);

  const getDestinationString = (cSel, cCust, sSel, sCust, pSel, pCust) => {
    const country = cSel === "custom" ? cCust : cSel;
    const hasData = country && country !== "custom" && Boolean(LOCATION_DATA[country]);
    
    const state = hasData ? (sSel === "custom" ? sCust : sSel) : (sCust || sSel);
    const place = hasData ? (pSel === "custom" ? pCust : pSel) : (pCust || pSel);
    
    return `${place || ""}, ${state || ""}, ${country || ""}`;
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

  const handleCustomPlaceChange = (val) => {
    setCustomPlace(val);
    syncDestinationString(selectedCountry, customCountry, selectedState, customState, selectedPlace, val);
  };

  useEffect(() => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString("en-US", options));
  }, []);

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
  }, [router]);

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
    if (!form.interests.trim()) {
      setMessage("Please list some interests.");
      return;
    }

    if (!supabase || !userId) {
      setMessage("Please sign in again before saving a trip.");
      return;
    }

    const destination = form.destination.trim();
    const dates = `${form.durationDays} days starting ${form.startDate}`;
    const newTrip = {
      user_id: userId,
      name: form.name.trim(),
      destination,
      dates,
      travelers: Number(form.travelers) || 1,
      interests: form.interests.trim(),
      notes: form.notes.trim(),
      image: buildTripImage(destination),
      gallery: buildTripGallery(destination),
    };

    setSavingTrip(true);
    setMessage("");

    const { data: savedTrip, error } = await supabase
      .from("trips")
      .insert(newTrip)
      .select("id, name, destination, dates, travelers, interests, notes, image, gallery, created_at, itinerary")
      .single();

    setSavingTrip(false);

    if (error) {
      setMessage("We couldn't save this trip. Please check your Supabase table policies and try again.");
      return;
    }

    setTrips((currentTrips) => [savedTrip, ...currentTrips]);
    setSavedTrip(savedTrip);
    setForm({
      name: "",
      destination: "",
      startDate: "",
      durationDays: "3",
      travelers: "2",
      interests: "",
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
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-sky-50 text-sky-700 font-semibold border border-sky-100/50 transition-all duration-200">
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

            <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200">
              <SettingsIcon />
              <span className="text-sm">Settings</span>
            </Link>
          </nav>
        </div>

        {/* User Card at bottom of Sidebar */}
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
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
              <Link href="/dashboard" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-sky-50 text-sky-700 font-semibold border border-sky-100/50 transition-all duration-200">
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

              <Link href="/settings" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200">
                <SettingsIcon />
                <span className="text-sm">Settings</span>
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

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:pl-64 min-h-screen pt-16 md:pt-0">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-8 sm:py-10 space-y-8">
          
          {/* Greeting Header */}
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200/60">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-sky-700">{currentDate}</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1 tracking-tight">Welcome back, {userName} 👋</h1>
              <p className="text-sm text-slate-500 mt-1.5 font-medium">Create new trips and coordinate smart AI-guided travel plans.</p>
            </div>
          </header>

          {/* Quick Statistics Banner */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Stat: Total Trips */}
            <div className="bg-white/80 border border-slate-200/60 p-5 rounded-3xl shadow-xs flex items-center gap-4 backdrop-blur-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 shadow-inner">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Trips</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{trips.length}</p>
              </div>
            </div>

            {/* Stat: Ready Plans */}
            <div className="bg-white/80 border border-slate-200/60 p-5 rounded-3xl shadow-xs flex items-center gap-4 backdrop-blur-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-inner">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Itineraries Ready</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{trips.filter(t => t.itinerary).length}</p>
              </div>
            </div>

            {/* Stat: Latest Venture */}
            <div className="bg-white/80 border border-slate-200/60 p-5 rounded-3xl shadow-xs flex items-center gap-4 md:col-span-2 backdrop-blur-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner">
                <MapPinIcon />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Latest Venture</p>
                <p className="text-base font-bold text-slate-900 mt-0.5 truncate" title={trips[0] ? formatDestinationDisplay(trips[0].destination) : "Start planning below!"}>
                  {trips[0] ? formatDestinationDisplay(trips[0].destination) : "Start planning below!"}
                </p>
              </div>
            </div>
          </section>

          {/* Quick Access Tools Dashboard */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Quick Tools Access</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Link href="/documents" className="group rounded-3xl border border-slate-200/70 bg-white p-5 shadow-xs hover:shadow-md hover:border-sky-300 hover:bg-sky-50/20 transition-all duration-300 transform hover:-translate-y-0.5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 group-hover:bg-sky-100 transition-colors shadow-inner">
                    <DocumentIcon />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors">Document Vault</p>
                    <p className="text-xs text-slate-500 mt-0.5">Store booking and travel files</p>
                  </div>
                </div>
              </Link>

              <Link href="/expenses" className="group rounded-3xl border border-slate-200/70 bg-white p-5 shadow-xs hover:shadow-md hover:border-amber-300 hover:bg-amber-50/20 transition-all duration-300 transform hover:-translate-y-0.5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors shadow-inner">
                    <ExpenseIcon />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">Expense Tracker</p>
                    <p className="text-xs text-slate-500 mt-0.5">Track budgets and spending</p>
                  </div>
                </div>
              </Link>

              <Link href="/trip-collab" className="group rounded-3xl border border-slate-200/70 bg-white p-5 shadow-xs hover:shadow-md hover:border-violet-300 hover:bg-violet-50/20 transition-all duration-300 transform hover:-translate-y-0.5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 group-hover:bg-violet-100 transition-colors shadow-inner">
                    <CollabIcon />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-violet-700 transition-colors">Trip Collaboration</p>
                    <p className="text-xs text-slate-500 mt-0.5">Invite friends and share plans</p>
                  </div>
                </div>
              </Link>
            </div>
          </section>

          {/* Primary Action Columns */}
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
            
            {/* LEFT COLUMN: Create a Trip Form */}
            <section className="space-y-6">
              <div className="bg-white/80 border border-slate-200/70 rounded-3xl p-6 shadow-xl shadow-slate-100/50 backdrop-blur-md space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Plan a New Trip</h2>
                  <p className="text-xs text-slate-500 mt-1">Specify destination and preferences to launch your AI assistant.</p>
                </div>

                {message ? (
                  <div className="rounded-2xl bg-sky-50 border border-sky-100 px-4 py-3 text-xs text-sky-700 flex items-start gap-2.5 animate-fade-in">
                    <svg className="h-4 w-4 shrink-0 text-sky-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{message}</span>
                  </div>
                ) : null}

                <form onSubmit={handleCreateTrip} className="space-y-5">
                  {/* Trip Name */}
                  <div className="relative">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Trip Name</label>
                    <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                      <span className="absolute left-4 top-3.5 text-slate-400">
                        <NoteIcon />
                      </span>
                      <input
                        value={form.name}
                        onChange={(event) => setForm({ ...form, name: event.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-slate-900 outline-none placeholder-slate-400"
                        placeholder="e.g. Winter in Kashmir"
                      />
                    </div>
                  </div>

                  {/* Destination Panel */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Destination</label>
                    
                    <div className="grid gap-3.5 grid-cols-1">
                      {/* Country Select */}
                      <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                        <span className="absolute left-4 top-3.5 text-slate-400">
                          <MapPinIcon />
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
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </div>

                      {/* State Select / Custom input */}
                      {selectedCountry && (
                        countryHasData ? (
                          <div className="space-y-3.5">
                            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                              <span className="absolute left-4 top-3.5 text-slate-400">
                                <MapPinIcon />
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
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                              </span>
                            </div>
                            
                            {selectedState === "custom" && (
                              <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                                <span className="absolute left-4 top-3.5 text-slate-400">
                                  <MapPinIcon />
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
                              <MapPinIcon />
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

                      {/* Place Select / Custom input */}
                      {selectedCountry && (
                        countryHasData ? (
                          selectedState && (
                            <div className="space-y-3.5">
                              <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                                <span className="absolute left-4 top-3.5 text-slate-400">
                                  <MapPinIcon />
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
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                  </svg>
                                </span>
                              </div>
                              
                              {selectedPlace === "custom" && (
                                <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                                  <span className="absolute left-4 top-3.5 text-slate-400">
                                    <MapPinIcon />
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
                          <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                            <span className="absolute left-4 top-3.5 text-slate-400">
                              <MapPinIcon />
                            </span>
                            <input
                              value={customPlace}
                              onChange={(event) => handleCustomPlaceChange(event.target.value)}
                              className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-slate-900 outline-none"
                              placeholder="Type place or city..."
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Date, Duration, Travelers Grid */}
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                    {/* Start Date */}
                    <div className="relative">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Start Date</label>
                      <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                        <span className="absolute left-4 top-3.5 text-slate-400">
                          <CalendarIcon />
                        </span>
                        <input
                          type="date"
                          value={form.startDate}
                          onChange={(event) => setForm({ ...form, startDate: event.target.value })}
                          className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-slate-900 outline-none"
                        />
                      </div>
                    </div>

                    {/* Duration */}
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
                          value={form.durationDays}
                          onChange={(event) => setForm({ ...form, durationDays: event.target.value })}
                          className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-slate-900 outline-none"
                        />
                      </div>
                    </div>

                    {/* Travelers */}
                    <div className="relative">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Travelers</label>
                      <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                        <span className="absolute left-4 top-3.5 text-slate-400">
                          <UsersIcon />
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

                  {/* Interests */}
                  <div className="relative">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Interests</label>
                    <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                      <span className="absolute left-4 top-3.5 text-slate-400">
                        <HeartIcon />
                      </span>
                      <input
                        value={form.interests}
                        onChange={(event) => setForm({ ...form, interests: event.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-slate-900 outline-none placeholder-slate-400"
                        placeholder="e.g. food, beaches, historic walks"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="relative">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Notes</label>
                    <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                      <textarea
                        value={form.notes}
                        onChange={(event) => setForm({ ...form, notes: event.target.value })}
                        className="min-h-24 w-full px-4 py-3 bg-transparent text-sm text-slate-900 outline-none placeholder-slate-400 resize-y"
                        placeholder="Any budget restrictions, accommodations, or special highlights..."
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={savingTrip}
                    className="w-full relative overflow-hidden flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-75 disabled:pointer-events-none transform hover:-translate-y-0.5"
                  >
                    {savingTrip ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
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

            {/* RIGHT COLUMN: Your Trips Feed */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    Saved Trips
                    <span className="bg-sky-50 border border-sky-100 text-sky-700 px-2 py-0.5 rounded-full text-xs font-bold shadow-xs">
                      {trips.length}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Select a trip card to view gallery highlights.</p>
                </div>
              </div>

              {trips.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center text-slate-500 backdrop-blur-xs">
                  <svg className="h-10 w-10 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="text-sm font-semibold">No saved trips yet</p>
                  <p className="text-xs text-slate-400 mt-1">Fill out the planner form on the left to start.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {trips.map((trip) => {
                    const isExpanded = activeTripId === trip.id;
                    const sanitizedImage = sanitizeImageUrl(trip.image, trip.destination, 1);
                    const gallery = (trip.gallery || [trip.image].filter(Boolean)).map((img, idx) => 
                      sanitizeImageUrl(img, trip.destination, idx + 1)
                    );
                    const travelerCount = String(trip.travelers || "1");

                    return (
                      <div
                        key={trip.id}
                        className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
                      >
                        {/* Clickable Header Banner */}
                        <div
                          className="cursor-pointer relative overflow-hidden"
                          onClick={() => setActiveTripId(isExpanded ? null : trip.id)}
                        >
                          {sanitizedImage ? (
                            <div className="relative h-44 w-full overflow-hidden">
                              <Image
                                src={sanitizedImage}
                                alt={formatDestinationDisplay(trip.destination)}
                                fill
                                loading="eager"
                                sizes="(max-width: 1024px) 100vw, 45vw"
                                className="object-cover group-hover:scale-103 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent" />
                              
                              {/* Itinerary Status Overlay */}
                              <div className="absolute top-4 right-4">
                                {trip.itinerary ? (
                                  <span className="backdrop-blur-md bg-emerald-500/90 text-white text-xs px-2.5 py-1 rounded-full font-semibold border border-emerald-400/20 flex items-center gap-1 shadow-sm">
                                    ✓ Itinerary ready
                                  </span>
                                ) : (
                                  <span className="backdrop-blur-md bg-slate-800/80 text-slate-200 text-xs px-2.5 py-1 rounded-full font-semibold border border-slate-700/20 flex items-center gap-1 shadow-sm">
                                    ⚡ Draft Plan
                                  </span>
                                )}
                              </div>

                              {/* Title and Destination Texts */}
                              <div className="absolute bottom-4 left-4 right-4">
                                <h3 className="text-lg font-bold text-white tracking-wide">{trip.name}</h3>
                                <p className="text-xs text-slate-200/95 font-medium mt-0.5 flex items-center gap-1.5 truncate">
                                  <span className="opacity-70"><MapPinIcon /></span>
                                  {formatDestinationDisplay(trip.destination)}
                                </p>
                              </div>
                            </div>
                          ) : null}
                        </div>

                        {/* Content Area */}
                        <div className="p-5 space-y-4">
                          {/* Calendar & Travelers Metabar */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-500">
                            <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1.5">
                              <span className="text-slate-400"><CalendarIcon /></span>
                              {formatDateRange(trip.dates)}
                            </span>
                            <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1.5">
                              <span className="text-slate-400"><UsersIcon /></span>
                              {travelerCount} traveler{travelerCount === "1" ? "" : "s"}
                            </span>
                          </div>

                          {/* Interests section */}
                          {trip.interests && (
                            <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50/50 rounded-2xl p-3 border border-slate-100">
                              <span className="text-rose-400 shrink-0 mt-0.5"><HeartIcon /></span>
                              <span className="line-clamp-2"><strong>Interests:</strong> {trip.interests}</span>
                            </div>
                          )}

                          {/* Action Items Footer */}
                          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                            <Link
                              href={`/planner?tripId=${encodeURIComponent(trip.id)}`}
                              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-center rounded-xl text-xs font-bold transition ${
                                trip.itinerary 
                                  ? "bg-slate-900 hover:bg-slate-800 text-white shadow-xs" 
                                  : "bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-100"
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
                              className="rounded-xl border border-slate-200 p-2.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all"
                              title="Delete Trip"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </div>

                        {/* Collapsible Photo Gallery */}
                        {isExpanded ? (
                          <div className="border-t border-slate-100 bg-slate-50/30 p-5 space-y-3 animate-fade-in">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Destination Highlights</p>
                              <button 
                                onClick={() => setActiveTripId(null)}
                                className="text-[10px] font-bold uppercase tracking-widest text-sky-600 hover:text-sky-700 transition"
                              >
                                Hide Gallery
                              </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {gallery.map((image, index) => (
                                <div
                                  key={`${trip.id}-${index}`}
                                  className="relative h-20 overflow-hidden rounded-xl group/img border border-slate-200/50 shadow-inner"
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
              )}
            </section>
          </div>
        </div>
      </main>

    </div>
  );
}
