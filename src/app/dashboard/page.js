"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

const buildTripGallery = (destination) => {
  const lowerDestination = (destination || "").toLowerCase();

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
  
  if (parts.length >= 3) {
    const place = parts[0];
    const state = parts[1];
    const country = parts[2];
    
    if (ALL_COUNTRIES.includes(country)) {
      result.selectedCountry = country;
      
      const states = LOCATION_DATA[country];
      if (states && states[state]) {
        result.selectedState = state;
        if (states[state].includes(place)) {
          result.selectedPlace = place;
        } else {
          result.selectedPlace = "custom";
          result.customPlace = place;
        }
      } else {
        result.selectedState = "custom";
        result.customState = state;
        result.selectedPlace = "custom";
        result.customPlace = place;
      }
      return result;
    }
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
    const state = sSel === "custom" ? sCust : sSel;
    const place = pSel === "custom" ? pCust : pSel;
    
    let parts = [];
    if (place) parts.push(place);
    if (state) parts.push(state);
    if (country) parts.push(country);
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

  const handleCustomPlaceChange = (val) => {
    setCustomPlace(val);
    syncDestinationString(selectedCountry, customCountry, selectedState, customState, selectedPlace, val);
  };

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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Preparing your dashboard...
      </div>
    );
  }

  const countryHasData = selectedCountry && selectedCountry !== "custom" && Boolean(LOCATION_DATA[selectedCountry]);

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_50%,_#ffffff_100%)] px-6 py-16 text-slate-900">
      {savedTrip ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="trip-saved-title"
            className="w-full max-w-md rounded-[1.5rem] border border-slate-200 bg-white p-6 text-center shadow-2xl shadow-slate-950/20"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">
              ✓
            </div>
            <h2 id="trip-saved-title" className="mt-4 text-2xl font-semibold text-slate-950">
              Trip saved successfully
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {savedTrip.name} has been added to your dashboard.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setSavedTrip(null)}
                className="flex-1 rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
              >
                OK
              </button>
              <Link
                href={`/planner?tripId=${encodeURIComponent(savedTrip.id)}`}
                className="flex-1 rounded-full bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700"
              >
                Plan trip
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {tripToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="trip-delete-title"
            className="w-full max-w-md rounded-[1.5rem] border border-slate-200 bg-white p-6 text-center shadow-2xl shadow-slate-950/20"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-2xl text-rose-700">
              ⚠️
            </div>
            <h2 id="trip-delete-title" className="mt-4 text-2xl font-semibold text-slate-950">
              Delete trip
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete <strong>{tripToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setTripToDelete(null)}
                className="flex-1 rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteTrip}
                className="flex-1 rounded-full bg-rose-600 px-5 py-3 font-semibold text-white transition hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/70">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Welcome back, {userName}</h1>
            <p className="mt-3 text-lg text-slate-600">
              Create trips and generate AI-powered itineraries for each one.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSignOut}
              className="rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="/documents" className="rounded-[1.5rem] border border-sky-200 bg-sky-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">📄</div>
                  <div>
                    <p className="text-sm font-semibold text-sky-700">Document Vault</p>
                    <p className="text-sm text-slate-600">Store booking and travel files</p>
                  </div>
                </div>
              </Link>

              <Link href="/expenses" className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">💸</div>
                  <div>
                    <p className="text-sm font-semibold text-amber-700">Expense Tracker</p>
                    <p className="text-sm text-slate-600">Track travel spending and stay on budget</p>
                  </div>
                </div>
              </Link>
            </div>

            <Link href="/trip-collab" className="flex items-center justify-between rounded-[1.5rem] border border-violet-200 bg-violet-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-100">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">🤝</div>
                <div>
                  <p className="text-sm font-semibold text-violet-700">Trip Collaboration</p>
                  <p className="text-sm text-slate-600">Invite friends and share trip details</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-violet-700">Open</span>
            </Link>

            <form onSubmit={handleCreateTrip} className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Create a trip</h2>
              <p className="mt-1 text-sm text-slate-600">Save a trip first, then open the planner for it.</p>
            </div>

            {message ? <p className="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-700">{message}</p> : null}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Trip name</label>
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3"
                placeholder="Summer in Tokyo"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">Destination</label>
              
              <div className="grid gap-3 sm:grid-cols-3">
                {/* Country Selection */}
                <div className="space-y-2">
                  <select
                    value={selectedCountry}
                    onChange={(event) => handleCountrySelect(event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
                  >
                    <option value="">Select Country...</option>
                    {ALL_COUNTRIES.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                {/* State/Region Selection */}
                {selectedCountry && (
                  countryHasData ? (
                    <div className="space-y-2">
                      <select
                        value={selectedState}
                        onChange={(event) => handleStateSelect(event.target.value)}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
                      >
                        <option value="">Select State/Region...</option>
                        {Object.keys(LOCATION_DATA[selectedCountry] || {}).map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                        <option value="custom">Other / Custom...</option>
                      </select>
                      {selectedState === "custom" && (
                        <input
                          value={customState}
                          onChange={(event) => handleCustomStateChange(event.target.value)}
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
                          placeholder="Type custom state/region..."
                        />
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        value={customState}
                        onChange={(event) => handleCustomStateChange(event.target.value)}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
                        placeholder="Type state/region (optional)..."
                      />
                    </div>
                  )
                )}

                {/* Place Selection */}
                {selectedCountry && (
                  countryHasData ? (
                    selectedState && (
                      <div className="space-y-2">
                        <select
                          value={selectedPlace}
                          onChange={(event) => handlePlaceSelect(event.target.value)}
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
                        >
                          <option value="">Select Place...</option>
                          {(LOCATION_DATA[selectedCountry]?.[selectedState] || []).map((place) => (
                            <option key={place} value={place}>{place}</option>
                          ))}
                          <option value="custom">Other / Custom...</option>
                        </select>
                        {selectedPlace === "custom" && (
                          <input
                            value={customPlace}
                            onChange={(event) => handleCustomPlaceChange(event.target.value)}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
                            placeholder="Type custom place..."
                          />
                        )}
                      </div>
                    )
                  ) : (
                    <div className="space-y-2">
                      <input
                        value={customPlace}
                        onChange={(event) => handleCustomPlaceChange(event.target.value)}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
                        placeholder="Type place or city..."
                      />
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(event) => setForm({ ...form, startDate: event.target.value })}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  value={form.durationDays}
                  onChange={(event) => setForm({ ...form, durationDays: event.target.value })}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Travelers</label>
                <input
                  type="number"
                  min="1"
                  value={form.travelers}
                  onChange={(event) => setForm({ ...form, travelers: event.target.value })}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Interests</label>
              <input
                value={form.interests}
                onChange={(event) => setForm({ ...form, interests: event.target.value })}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3"
                placeholder="food, nightlife, museums"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
              <textarea
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                className="min-h-24 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3"
                placeholder="Any preferences or must-sees?"
              />
            </div>

              <button
                type="submit"
                disabled={savingTrip}
                className="w-full rounded-full bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700"
              >
                {savingTrip ? "Saving..." : "Save trip"}
              </button>
            </form>
          </div>

          <div className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-white p-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Your trips</h2>
              <p className="mt-1 text-sm text-slate-600">Choose a trip to generate a personalized itinerary.</p>
            </div>

            {trips.length === 0 ? (
              <div className="rounded-[1.25rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                No trips yet. Create one to get started.
              </div>
            ) : (
              <div className="space-y-3">
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
                      className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-50"
                    >
                      <div
                        className="cursor-pointer"
                        onClick={() => setActiveTripId(isExpanded ? null : trip.id)}
                      >
                        {sanitizedImage ? (
                          <div className="relative h-36 w-full">
                            <Image
                              src={sanitizedImage}
                              alt={trip.destination}
                              fill
                              loading="eager"
                              sizes="(max-width: 1024px) 100vw, 45vw"
                              className="object-cover"
                            />
                          </div>
                        ) : null}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-lg font-semibold text-slate-950">{trip.name}</h3>
                              <p className="mt-1 text-sm text-slate-600">{trip.destination}</p>
                              <p className="mt-2 text-sm text-slate-500">
                                {formatDateRange(trip.dates)} · {travelerCount} traveler{travelerCount === "1" ? "" : "s"}
                              </p>
                              {trip.itinerary ? (
                                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                  ✓ Itinerary ready
                                </span>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/planner?tripId=${encodeURIComponent(trip.id)}`}
                                className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
                                onClick={(event) => event.stopPropagation()}
                              >
                                {trip.itinerary ? "View itinerary" : "Plan trip"}
                              </Link>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleDeleteTrip(trip.id, trip.name);
                                }}
                                className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                                title="Delete Trip"
                              >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {isExpanded ? (
                        <div className="border-t border-slate-200 bg-white/70 p-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-800">Explore more views</p>
                            <span className="text-xs font-medium uppercase tracking-[0.2em] text-sky-700">
                              Tap to close
                            </span>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {gallery.map((image, index) => (
                              <div
                                key={`${trip.id}-${index}`}
                                className="relative h-20 overflow-hidden rounded-xl"
                              >
                                <Image
                                  src={image}
                                  alt={`${trip.destination} view ${index + 1}`}
                                  fill
                                  sizes="(max-width: 640px) 50vw, 15vw"
                                  className="object-cover"
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
          </div>
        </div>
      </div>
    </div>
  );
}
