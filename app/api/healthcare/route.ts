import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location") || "Aurora, CO";

    // Google Places API - Text Search
    const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

    if (!GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: "Google Maps API key not configured" },
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
      }
    );

    if (placesResponse.data.status !== "OK") {
      return NextResponse.json(
        { error: `Google Places API error: ${placesResponse.data.status}` },
        { status: 400 }
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
    return NextResponse.json(
      { error: error.message || "Failed to fetch healthcare businesses" },
      { status: 500 }
    );
  }
}
