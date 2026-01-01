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

export async function POST(request: Request) {
  try {
    const { businessName, address } = await request.json();

    if (!businessName) {
      return NextResponse.json(
        { error: "Business name is required" },
        { status: 400 }
      );
    }

    const allFunding: FundingResult[] = [];

    // 1. Search USAspending.gov API
    try {
      const usaSpendingResponse = await axios.post(
        "https://api.usaspending.gov/api/v2/search/spending_by_award/",
        {
          filters: {
            keywords: [businessName],
            award_type_codes: [
              "02", "03", "04", "05", // Grants
              "06", "07", "08", "09", "10", "11", // Loans
            ],
            place_of_performance_locations: [
              {
                country: "USA",
                state: "CO",
              },
            ],
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
        }
      );

      if (usaSpendingResponse.data?.results) {
        usaSpendingResponse.data.results.forEach((award: any) => {
          allFunding.push({
            source: "USAspending.gov",
            recipientName: award.recipient_name || award.Recipient_Name,
            awardAmount: parseFloat(award.Award_Amount || award.total_obligation || 0),
            awardDate: award.period_of_performance_start_date || award.Start_Date || "N/A",
            description: award.description || award.Description || "Federal funding",
            fundingAgency: award.awarding_agency_name || award.Awarding_Agency || "Federal Agency",
            awardType: award.type_description || award.Award_Type || "Grant/Loan",
          });
        });
      }
    } catch (usaError) {
      console.error("USAspending.gov API error:", usaError);
    }

    // 2. Search for SBA loans/grants (using USAspending data filtered by SBA)
    try {
      const sbaResponse = await axios.post(
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
            place_of_performance_locations: [
              {
                country: "USA",
                state: "CO",
              },
            ],
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
        }
      );

      if (sbaResponse.data?.results) {
        sbaResponse.data.results.forEach((award: any) => {
          allFunding.push({
            source: "SBA (via USAspending.gov)",
            recipientName: award.recipient_name,
            awardAmount: parseFloat(award.Award_Amount || award.total_obligation || 0),
            awardDate: award.period_of_performance_start_date || "N/A",
            description: award.description || "SBA funding",
            fundingAgency: "Small Business Administration",
            awardType: award.type_description || "SBA Loan/Grant",
          });
        });
      }
    } catch (sbaError) {
      console.error("SBA search error:", sbaError);
    }

    // 3. Search for Medicare/Medicaid related funding (HHS)
    try {
      const hhsResponse = await axios.post(
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
            place_of_performance_locations: [
              {
                country: "USA",
                state: "CO",
              },
            ],
          },
          page: 1,
          limit: 50,
        }
      );

      if (hhsResponse.data?.results) {
        hhsResponse.data.results.forEach((award: any) => {
          allFunding.push({
            source: "HHS (via USAspending.gov)",
            recipientName: award.recipient_name,
            awardAmount: parseFloat(award.Award_Amount || award.total_obligation || 0),
            awardDate: award.period_of_performance_start_date || "N/A",
            description: award.description || "HHS healthcare funding",
            fundingAgency: "Department of Health and Human Services",
            awardType: award.type_description || "Grant",
          });
        });
      }
    } catch (hhsError) {
      console.error("HHS search error:", hhsError);
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
      totalFunding: uniqueFunding.reduce((sum, f) => sum + f.awardAmount, 0),
      fundingCount: uniqueFunding.length,
      funding: uniqueFunding,
    });
  } catch (error: any) {
    console.error("Error fetching funding data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch funding data" },
      { status: 500 }
    );
  }
}
