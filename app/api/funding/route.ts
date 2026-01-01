import { NextResponse } from "next/server";
import axios from "axios";

interface FundingResult {
  source: string;
  recipientName: string;
  awardAmount: number;
  awardDate: string;
  description: string;
  fundingAgency: string;
  awardType: string;
}

// State abbreviation mapping for common states
const STATE_ABBR_MAP: Record<string, string> = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
  'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
  'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
  'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
  'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
  'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
  'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
  'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
  'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
  'wisconsin': 'WI', 'wyoming': 'WY',
};

function extractStateFromAddress(address: string): string {
  if (!address) return "";

  // Try to match 2-letter state code (e.g., "City, CO 80014")
  const stateCodeMatch = address.match(/,\s*([A-Z]{2})(?:\s+\d{5})?/);
  if (stateCodeMatch) {
    return stateCodeMatch[1];
  }

  // Try to match full state name
  const stateNameMatch = address.match(/,\s*([A-Za-z\s]+?)(?:,|\s+\d{5}|$)/);
  if (stateNameMatch) {
    const stateName = stateNameMatch[1].trim().toLowerCase();
    return STATE_ABBR_MAP[stateName] || "";
  }

  return "";
}

export async function POST(request: Request) {
  try {
    const { businessName, address } = await request.json();

    if (!businessName) {
      return NextResponse.json(
        { error: "Business name is required" },
        { status: 400 }
      );
    }

    const state = extractStateFromAddress(address || "");
    const allFunding: FundingResult[] = [];

    // Build location filter only if we have a state
    const locationFilter = state ? {
      place_of_performance_locations: [
        {
          country: "USA",
          state: state,
        },
      ],
    } : {};

    // Make all API calls in parallel using Promise.allSettled
    const [usaSpendingResult, sbaResult, hhsResult] = await Promise.allSettled([
      // 1. USAspending.gov general search
      axios.post(
        "https://api.usaspending.gov/api/v2/search/spending_by_award/",
        {
          filters: {
            keywords: [businessName],
            award_type_codes: [
              "02", "03", "04", "05", // Grants
              "06", "07", "08", "09", "10", "11", // Loans
            ],
            ...locationFilter,
          },
          fields: [
            "Award ID",
            "Recipient Name",
            "Award Amount",
            "Start Date",
            "Description",
            "Awarding Agency",
            "Award Type",
          ],
          page: 1,
          limit: 100,
          sort: "Award Amount",
          order: "desc",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      ),

      // 2. SBA search
      axios.post(
        "https://api.usaspending.gov/api/v2/search/spending_by_award/",
        {
          filters: {
            keywords: [businessName],
            agencies: [
              {
                type: "awarding",
                tier: "toptier",
                name: "Small Business Administration",
              },
            ],
            ...locationFilter,
          },
          fields: [
            "Award ID",
            "Recipient Name",
            "Award Amount",
            "Start Date",
            "Description",
            "Award Type",
          ],
          page: 1,
          limit: 50,
        },
        {
          timeout: 15000,
        }
      ),

      // 3. HHS search
      axios.post(
        "https://api.usaspending.gov/api/v2/search/spending_by_award/",
        {
          filters: {
            keywords: [businessName, "healthcare", "home health"],
            agencies: [
              {
                type: "awarding",
                tier: "toptier",
                name: "Department of Health and Human Services",
              },
            ],
            ...locationFilter,
          },
          page: 1,
          limit: 50,
        },
        {
          timeout: 15000,
        }
      ),
    ]);

    // Process USAspending.gov results
    if (usaSpendingResult.status === 'fulfilled' && usaSpendingResult.value.data?.results) {
      usaSpendingResult.value.data.results.forEach((award: any) => {
        allFunding.push({
          source: "USAspending.gov",
          recipientName: award.recipient_name || award.Recipient_Name || "Unknown",
          awardAmount: parseFloat(award.Award_Amount || award.total_obligation || 0),
          awardDate: award.period_of_performance_start_date || award.Start_Date || "N/A",
          description: award.description || award.Description || "Federal funding",
          fundingAgency: award.awarding_agency_name || award.Awarding_Agency || "Federal Agency",
          awardType: award.type_description || award.Award_Type || "Grant/Loan",
        });
      });
    }

    // Process SBA results
    if (sbaResult.status === 'fulfilled' && sbaResult.value.data?.results) {
      sbaResult.value.data.results.forEach((award: any) => {
        allFunding.push({
          source: "SBA (via USAspending.gov)",
          recipientName: award.recipient_name || "Unknown",
          awardAmount: parseFloat(award.Award_Amount || award.total_obligation || 0),
          awardDate: award.period_of_performance_start_date || "N/A",
          description: award.description || "SBA funding",
          fundingAgency: "Small Business Administration",
          awardType: award.type_description || "SBA Loan/Grant",
        });
      });
    }

    // Process HHS results
    if (hhsResult.status === 'fulfilled' && hhsResult.value.data?.results) {
      hhsResult.value.data.results.forEach((award: any) => {
        allFunding.push({
          source: "HHS (via USAspending.gov)",
          recipientName: award.recipient_name || "Unknown",
          awardAmount: parseFloat(award.Award_Amount || award.total_obligation || 0),
          awardDate: award.period_of_performance_start_date || "N/A",
          description: award.description || "HHS healthcare funding",
          fundingAgency: "Department of Health and Human Services",
          awardType: award.type_description || "Grant",
        });
      });
    }

    // Remove duplicates and sort by amount
    const uniqueFunding = Array.from(
      new Map(
        allFunding.map((item) => [
          `${item.recipientName}-${item.awardAmount}-${item.awardDate}`,
          item,
        ])
      ).values()
    ).sort((a, b) => b.awardAmount - a.awardAmount);

    return NextResponse.json({
      success: true,
      businessName,
      state: state || "All states",
      totalFunding: uniqueFunding.reduce((sum, f) => sum + f.awardAmount, 0),
      fundingCount: uniqueFunding.length,
      funding: uniqueFunding,
    });
  } catch (error: any) {
    console.error("Error fetching funding data:", error);
    return NextResponse.json(
      { error: "Failed to fetch funding data. Please try again." },
      { status: 500 }
    );
  }
}
