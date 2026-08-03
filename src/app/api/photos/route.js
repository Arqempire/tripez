import { NextResponse } from "next/server";
import {
  DESTINATION_PHOTO_MAP,
  DEFAULT_FALLBACK_PHOTOS,
  normalizeDestination,
} from "@/lib/destinations";

// 7-day in-memory cache for Unsplash API responses
// Key: normalized destination string -> Value: { photos: Array, timestamp: Number }
const UNSPLASH_CACHE = new Map();
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get("query") || "";

    if (!rawQuery.trim()) {
      return NextResponse.json({ photos: [] });
    }

    // 1. Smart destination extraction & normalization
    const normalized = normalizeDestination(rawQuery);
    const searchKey = normalized.toLowerCase();

    // 2. Curated images first: Check DESTINATION_PHOTO_MAP before calling Unsplash
    if (DESTINATION_PHOTO_MAP[searchKey] && DESTINATION_PHOTO_MAP[searchKey].length >= 3) {
      return NextResponse.json({ photos: DESTINATION_PHOTO_MAP[searchKey].slice(0, 3) });
    }

    // Check for partial key match in curated map
    for (const [key, curatedPhotos] of Object.entries(DESTINATION_PHOTO_MAP)) {
      if ((searchKey.includes(key) || key.includes(searchKey)) && curatedPhotos.length >= 3) {
        return NextResponse.json({ photos: curatedPhotos.slice(0, 3) });
      }
    }

    const photos = [];

    // Gather any partial curated images if available (<3 photos)
    if (DESTINATION_PHOTO_MAP[searchKey]) {
      DESTINATION_PHOTO_MAP[searchKey].forEach(img => photos.push(img));
    }

    // 3. Cache Check: Check if normalized query result is cached in memory
    const now = Date.now();
    const cached = UNSPLASH_CACHE.get(searchKey);
    if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
      cached.photos.forEach(img => {
        if (!photos.includes(img) && photos.length < 3) {
          photos.push(img);
        }
      });

      if (photos.length >= 3) {
        return NextResponse.json({ photos: photos.slice(0, 3) });
      }
    }

    // 4. Unsplash Fallback API Call: Only call when fewer than 3 images and key present
    // Strict requirement: Use process.env.UNSPLASH_ACCESS_KEY ONLY; NEVER use NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
    const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;

    if (unsplashAccessKey && photos.length < 3) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout
      const fetchedFromUnsplash = [];

      try {
        const queryTerm = `${normalized} travel landscape photography`.trim();
        const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(queryTerm)}&per_page=3&orientation=landscape&client_id=${unsplashAccessKey}`;

        const res = await fetch(unsplashUrl, {
          signal: controller.signal,
          next: { revalidate: 604800 }, // 7-day revalidation
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            data.results.forEach((item) => {
              const url = item.urls?.regular || item.urls?.full;
              if (url && !photos.includes(url) && photos.length < 3) {
                photos.push(url);
                fetchedFromUnsplash.push(url);
              }
            });

            // Cache Unsplash responses by normalized key for 7 days
            if (fetchedFromUnsplash.length > 0) {
              UNSPLASH_CACHE.set(searchKey, {
                photos: fetchedFromUnsplash,
                timestamp: now,
              });
            }
          }
        }
      } catch (e) {
        clearTimeout(timeoutId);
        console.warn("Unsplash API fetch notice:", e.name === "AbortError" ? "Request timed out after 5s" : e.message);
      }
    }

    // 5. Generic Fallback if still under 3 images
    if (photos.length < 3) {
      DEFAULT_FALLBACK_PHOTOS.forEach((fallbackImg) => {
        if (!photos.includes(fallbackImg) && photos.length < 3) {
          photos.push(fallbackImg);
        }
      });
    }

    return NextResponse.json({ photos: photos.slice(0, 3) });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to process image request" }, { status: 500 });
  }
}
