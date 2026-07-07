"use client";

import { Suspense } from "react";
import Image from "next/image";
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

function PlannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = searchParams.get("tripId");
  const tripName = searchParams.get("trip") || "Your trip";
  const destination = searchParams.get("destination") || "";

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [savedItinerary, setSavedItinerary] = useState(null);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [tripDetails, setTripDetails] = useState(null);
  const [form, setForm] = useState({
    destination: destination || tripName,
    days: "3",
    travelers: "2",
    interests: "food, culture, scenic views",
    budget: "mid-range",
    style: "balanced",
  });
  const [message, setMessage] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [customCountry, setCustomCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [customState, setCustomState] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");
  const [customPlace, setCustomPlace] = useState("");

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

    const ensureSession = async () => {
      if (!supabase) {
        router.replace("/login");
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) {
        router.replace("/login");
        return;
      }

      if (tripId) {
        const { data: savedTrip, error } = await supabase
          .from("trips")
          .select("id, name, destination, dates, travelers, interests, notes, image, gallery, created_at, itinerary")
          .eq("id", tripId)
          .eq("user_id", data.session.user.id)
          .single();

        if (!active) return;

        if (error) {
          setMessage("We couldn't load this saved trip. You can still plan manually.");
        } else if (savedTrip) {
          setTripDetails(savedTrip);
          if (savedTrip.itinerary) {
            setItinerary(savedTrip.itinerary);
            setSavedItinerary(savedTrip.itinerary);
          }
          const loadedDest = savedTrip.destination || "";
          const parsed = parseDestination(loadedDest);
          setSelectedCountry(parsed.selectedCountry);
          setCustomCountry(parsed.customCountry);
          setSelectedState(parsed.selectedState);
          setCustomState(parsed.customState);
          setSelectedPlace(parsed.selectedPlace);
          setCustomPlace(parsed.customPlace);

          const loadedDates = savedTrip.dates || "";
          const dateMatch = loadedDates.match(/(\d+)\s+days\s+starting\s+([\d-]+)/);
          const parsedDays = dateMatch ? dateMatch[1] : "3";

          setForm((current) => ({
            ...current,
            destination: loadedDest || current.destination,
            days: parsedDays,
            travelers: String(savedTrip.travelers || current.travelers || "2"),
            interests: savedTrip.interests || current.interests,
          }));
        }
      } else if (destination) {
        setForm((current) => ({ ...current, destination }));
        const parsed = parseDestination(destination);
        setSelectedCountry(parsed.selectedCountry);
        setCustomCountry(parsed.customCountry);
        setSelectedState(parsed.selectedState);
        setCustomState(parsed.customState);
        setSelectedPlace(parsed.selectedPlace);
        setCustomPlace(parsed.customPlace);
      }

      if (active) setLoading(false);
    };

    ensureSession();

    return () => {
      active = false;
    };
  }, [destination, router, tripId]);

  const handleGenerate = async (event) => {
    event.preventDefault();
    setGenerating(true);
    setMessage("");

    try {
      const response = await fetch("/api/itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to generate itinerary.");
      }

      setItinerary(payload.itinerary);
      setActiveDayIndex(0);
      setMessage("Your AI itinerary is ready.");
    } catch (error) {
      setMessage(error.message || "Unable to generate itinerary.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveItinerary = async () => {
    if (!supabase || !tripId || !itinerary) return;
    setSaving(true);
    setMessage("");

    try {
      const destination = (form.destination || "").trim();
      const prevDates = tripDetails?.dates || "";
      const dateMatch = prevDates.match(/(\d+)\s+days\s+starting\s+([\d-]+)/);
      const startDate = dateMatch ? dateMatch[2] : new Date().toISOString().split("T")[0];
      const dates = `${form.days} days starting ${startDate}`;

      const updatedFields = {
        itinerary,
        destination,
        dates,
        travelers: Number(form.travelers) || 1,
        interests: (form.interests || "").trim(),
        image: buildTripImage(destination),
        gallery: buildTripGallery(destination),
      };

      const { error } = await supabase
        .from("trips")
        .update(updatedFields)
        .eq("id", tripId);

      if (error) {
        throw error;
      }

      setSavedItinerary(itinerary);
      setTripDetails((prev) => prev ? { ...prev, ...updatedFields } : null);
      setMessage("Itinerary and trip details saved successfully!");
    } catch (error) {
      setMessage("Unable to save itinerary: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateNew = () => {
    setItinerary(null);
    const formElement = document.getElementById("planner-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const plannerDestination = form.destination || tripDetails?.destination || destination || tripName;
  const plannerTitle = tripDetails?.name || tripName;

  const gallery = useMemo(() => {
    if (Array.isArray(tripDetails?.gallery) && tripDetails.gallery.length) {
      return tripDetails.gallery.map((img, idx) => 
        sanitizeImageUrl(img, plannerDestination, idx + 1)
      );
    }

    return buildTripGallery(plannerDestination);
  }, [plannerDestination, tripDetails]);

  const explorerHighlights = useMemo(() => {
    const target = (plannerDestination || "travel").toLowerCase();

    if (target.includes("gulmarg")) {
      return [
        { title: "Snowy slopes", description: "Glide through alpine meadows and cable-car views." },
        { title: "Winter charm", description: "Enjoy cozy stays and warm local tea after sunset." },
        { title: "Adventure mix", description: "Ski, ride, and explore the mountain trails at your pace." },
      ];
    }

    if (target.includes("srinagar") || target.includes("dal") || target.includes("kashmir")) {
      return [
        { title: "Lakefront calm", description: "Houseboats, shikara rides, and dawn reflections." },
        { title: "Cultural layers", description: "Markets, gardens, and heritage cafés around every corner." },
        { title: "Slow luxury", description: "A laid-back journey with scenic stays and local food." },
      ];
    }

    return [
      { title: "Local favorites", description: "Discover the signature spots that define the place." },
      { title: "Scenic routes", description: "Blend iconic views with tucked-away neighborhoods." },
      { title: "Food & culture", description: "Match your stay with the best local flavours and traditions." },
    ];
  }, [plannerDestination]);

  const explorerTags = useMemo(() => {
    const target = (plannerDestination || "travel").toLowerCase();
    if (target.includes("gulmarg")) {
      return ["Snow", "Cable car", "Adventure", "Cozy stays"];
    }
    if (target.includes("srinagar") || target.includes("dal") || target.includes("kashmir")) {
      return ["Houseboats", "Shikara", "Gardens", "Street food"];
    }
    return ["Culture", "Views", "Food", "Hidden gems"];
  }, [plannerDestination]);

  const summary = useMemo(() => {
    if (!itinerary) return null;
    return {
      title: itinerary.title || `${form.destination} Adventure`,
      overview: itinerary.overview || "A tailored plan is ready.",
      days: itinerary.days || [],
      tips: itinerary.tips || [],
    };
  }, [form.destination, itinerary]);

  const activeDay = summary?.days?.[activeDayIndex] || summary?.days?.[0] || null;
  const itineraryStats = summary
    ? [
        { label: "Days", value: String(summary.days.length || form.days || "1") },
        { label: "Travelers", value: String(form.travelers || "1") },
        { label: "Style", value: form.style },
      ]
    : [];

  const formatPlanText = (text) => {
    if (!text) return "";
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    if (parts.length === 1) return text;
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <strong key={index} className="font-semibold text-sky-950 bg-sky-100/60 px-1 py-0.5 rounded-md border border-sky-200/40 shadow-2xs">
            {part}
          </strong>
        );
      }
      return part;
    });
  };

  const activeDayHighlights = useMemo(() => {
    if (!activeDay || !activeDay.plan) return [];
    const regex = /\*\*([^*]+)\*\*/g;
    const matches = [];
    let match;
    while ((match = regex.exec(activeDay.plan)) !== null) {
      if (match[1]) matches.push(match[1].trim());
    }
    return Array.from(new Set(matches)).slice(0, 5);
  }, [activeDay]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Preparing your planner...
      </div>
    );
  }

  const countryHasData = selectedCountry && selectedCountry !== "custom" && Boolean(LOCATION_DATA[selectedCountry]);

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_50%,_#ffffff_100%)] px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/70">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">AI itinerary planner</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Plan {plannerTitle} with smart recommendations</h1>
            <p className="mt-3 max-w-2xl text-lg text-slate-600">
              Generate a personalized trip plan based on your destination, pace, interests, and budget.
            </p>
          </div>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
          >
            <span aria-hidden="true">←</span>
            <span>Back to dashboard</span>
          </a>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50 shadow-lg shadow-slate-200/70">
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={gallery[0]}
                  alt={plannerDestination}
                  fill
                  loading="eager"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-200">Destination explorer</p>
                  <h2 className="mt-2 text-2xl font-semibold">{plannerDestination}</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-200">
                    Step into the place before you plan it—browse the mood, highlights, and signature experiences that make the destination special.
                  </p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {explorerTags.map((tag) => (
                    <span key={tag} className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {explorerHighlights.map((item) => (
                    <div key={item.title} className="rounded-[1.1rem] border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {gallery.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="relative h-24 overflow-hidden rounded-2xl shadow-sm"
                    >
                      <Image
                        src={image}
                        alt={`${plannerDestination} view ${index + 1}`}
                        fill
                        sizes="(max-width: 640px) 50vw, 15vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <form id="planner-form" onSubmit={handleGenerate} className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Days</label>
                <input
                  type="number"
                  min="1"
                  value={form.days}
                  onChange={(event) => setForm({ ...form, days: event.target.value })}
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
                placeholder="food, museums, nightlife"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Budget</label>
                <select
                  value={form.budget}
                  onChange={(event) => setForm({ ...form, budget: event.target.value })}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3"
                >
                  <option value="budget">Budget</option>
                  <option value="mid-range">Mid-range</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Style</label>
                <select
                  value={form.style}
                  onChange={(event) => setForm({ ...form, style: event.target.value })}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3"
                >
                  <option value="balanced">Balanced</option>
                  <option value="relaxed">Relaxed</option>
                  <option value="adventurous">Adventurous</option>
                  <option value="romantic">Romantic</option>
                </select>
              </div>
            </div>

            {message ? <p className="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-700">{message}</p> : null}

              <button
                type="submit"
                disabled={generating}
                className="w-full rounded-full bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {generating ? "Generating itinerary..." : "Generate itinerary"}
              </button>
            </form>

          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-lg shadow-slate-200/70">
            {summary ? (
              <div>
                <div className="relative min-h-80 overflow-hidden bg-slate-950">
                  <Image
                    src={gallery[activeDayIndex % gallery.length]}
                    alt={plannerDestination}
                    fill
                    loading="eager"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-slate-900/10" />
                  <div className="relative flex min-h-80 flex-col justify-end p-6 text-white">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-200">Generated plan</p>
                    <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{summary.title}</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-100">{summary.overview}</p>

                    <div className="mt-5 grid grid-cols-3 gap-3">
                      {itineraryStats.map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-white/20 bg-white/15 p-3 backdrop-blur">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">{stat.label}</p>
                          <p className="mt-1 text-lg font-semibold capitalize">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6 p-6">
                  {/* Action Bar */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[1.25rem] border border-slate-100 bg-slate-50 p-4 shadow-inner">
                    <div className="flex items-center gap-2">
                      <span className={`flex h-2.5 w-2.5 items-center justify-center rounded-full ${
                        savedItinerary && JSON.stringify(savedItinerary) === JSON.stringify(itinerary)
                          ? "bg-emerald-500"
                          : "bg-amber-500 animate-pulse"
                      }`}></span>
                      <p className="text-sm font-medium text-slate-600">
                        {savedItinerary && JSON.stringify(savedItinerary) === JSON.stringify(itinerary)
                          ? "Itinerary is saved to this trip."
                          : "You have unsaved changes."}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {tripId ? (
                        <button
                          type="button"
                          onClick={handleSaveItinerary}
                          disabled={saving || (savedItinerary && JSON.stringify(savedItinerary) === JSON.stringify(itinerary))}
                          className="rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-md shadow-sky-100 disabled:shadow-none"
                        >
                          {saving ? "Saving..." : savedItinerary && JSON.stringify(savedItinerary) === JSON.stringify(itinerary) ? "Saved ✓" : "Save Itinerary"}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 italic">
                          Link to a trip from dashboard to save
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={handleGenerateNew}
                        className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 shadow-sm"
                      >
                        Generate New
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {summary.days.map((day, index) => {
                      const isActive = index === activeDayIndex;

                      return (
                        <button
                          key={`${day.day}-${index}`}
                          type="button"
                          onClick={() => setActiveDayIndex(index)}
                          className={`min-w-28 rounded-2xl border px-4 py-3 text-left transition ${
                            isActive
                              ? "border-sky-500 bg-sky-600 text-white shadow-lg shadow-sky-200"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-300 hover:bg-sky-50"
                          }`}
                        >
                          <span className={`text-xs font-semibold uppercase tracking-[0.2em] ${isActive ? "text-sky-100" : "text-slate-500"}`}>
                            Day {day.day}
                          </span>
                          <span className="mt-1 line-clamp-2 block text-sm font-semibold">{day.title}</span>
                        </button>
                      );
                    })}
                  </div>

                  {activeDay ? (
                    <div className="grid gap-4 md:grid-cols-[0.75fr_1.25fr]">
                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                        <div className="relative h-44">
                          <Image
                            src={gallery[activeDayIndex % gallery.length]}
                            alt={`${plannerDestination} day ${activeDay.day}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 20vw"
                            className="object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">Focus day</p>
                          <p className="mt-2 text-2xl font-semibold text-slate-950">Day {activeDay.day}</p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-700">Day route</p>
                        <h3 className="mt-2 text-2xl font-semibold text-slate-950">{activeDay.title}</h3>
                        
                        {activeDayHighlights.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {activeDayHighlights.map((high, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 rounded-full bg-sky-50 border border-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
                                📍 {high}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <p className="mt-4 text-sm leading-7 text-slate-600 whitespace-pre-wrap">
                          {formatPlanText(activeDay.plan)}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {summary.tips.length ? (
                    <div className="rounded-[1.25rem] border border-amber-200 bg-amber-50/50 p-5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl" aria-hidden="true">💡</span>
                        <h4 className="font-semibold text-amber-900">Must-know travel tips</h4>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {summary.tips.map((tip, idx) => (
                          <div key={idx} className="flex gap-2.5 rounded-2xl bg-white p-4 border border-amber-100 shadow-sm">
                            <span className="text-amber-500 font-bold" aria-hidden="true">•</span>
                            <p className="text-sm text-slate-700 leading-relaxed">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[320px] items-center justify-center rounded-[1.25rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-600">
                Your generated itinerary will appear here after you submit the form.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">Loading planner...</div>}>
      <PlannerContent />
    </Suspense>
  );
}
