import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location")?.trim() || "Aurora, CO";

    // Validate location input
    if (!location || location.length < 2) {
      return NextResponse.json(
        { error: "Please provide a valid location" },
        { status: 400 }
      );
    }

    if (location.length > 100) {
      return NextResponse.json(
        { error: "Location query too long" },
        { status: 400 }
      );
    }

    const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

    if (!GOOGLE_API_KEY) {
      console.error("Google Maps API key not configured");
      return NextResponse.json(
        { error: "Service configuration error. Please contact support." },
        { status: 500 }
      );
    }

    // Search for home healthcare businesses
    const placesResponse = await axios.get(
      "https://maps.googleapis.com/maps/api/place/textsearch/json",
      {
        params: {
          query: `home healthcare ${location}`,
          key: GOOGLE_API_KEY,
        },
        timeout: 15000,
      }
    );

    // Handle various Google API response statuses
    if (placesResponse.data.status === "ZERO_RESULTS") {
      return NextResponse.json({
        success: true,
        businesses: [],
        location,
        message: "No home healthcare businesses found in this location",
      });
    }

    if (placesResponse.data.status === "INVALID_REQUEST") {
      return NextResponse.json(
        { error: "Invalid location format. Please use 'City, State' format." },
        { status: 400 }
      );
    }

    if (placesResponse.data.status === "REQUEST_DENIED") {
      console.error("Google Places API request denied");
      return NextResponse.json(
        { error: "Service temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    if (placesResponse.data.status !== "OK") {
      console.error("Google Places API error:", placesResponse.data.status);
      return NextResponse.json(
        { error: "Failed to search businesses. Please try again." },
        { status: 500 }
      );
    }

    const businesses = placesResponse.data.results.map((place: any) => ({
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      location: place.geometry?.location,
      types: place.types,
      businessStatus: place.business_status,
    }));

    return NextResponse.json({
      success: true,
      businesses,
      location,
    });
  } catch (error: any) {
    console.error("Error fetching healthcare businesses:", error);

    // Provide user-friendly error messages
    if (error.code === 'ECONNABORTED') {
      return NextResponse.json(
        { error: "Request timeout. Please try again." },
        { status: 504 }
      );
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: "Network error. Please check your connection." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to search businesses. Please try again later." },
      { status: 500 }
    );
  }
}
