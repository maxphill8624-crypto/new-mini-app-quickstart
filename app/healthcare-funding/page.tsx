"use client";
import { useState, useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import axios from "axios";
import styles from "./page.module.css";

interface Business {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  userRatingsTotal?: number;
  businessStatus?: string;
}

interface FundingRecord {
  source: string;
  recipientName: string;
  awardAmount: number;
  awardDate: string;
  description: string;
  fundingAgency: string;
  awardType: string;
}

interface BusinessWithFunding extends Business {
  funding?: {
    totalFunding: number;
    fundingCount: number;
    funding: FundingRecord[];
  };
  isLoadingFunding?: boolean;
}

export default function HealthcareFundingPage() {
  const { isFrameReady, setFrameReady } = useMiniKit();
  const [businesses, setBusinesses] = useState<BusinessWithFunding[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState("Aurora, CO");
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const searchBusinesses = async () => {
    setIsLoading(true);
    setError("");
    setBusinesses([]);

    try {
      const response = await axios.get(`/api/healthcare?location=${encodeURIComponent(location)}`);

      if (response.data.success) {
        setBusinesses(response.data.businesses);
      } else {
        setError("Failed to fetch healthcare businesses");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred while fetching businesses");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFunding = async (business: BusinessWithFunding, index: number) => {
    const updatedBusinesses = [...businesses];
    updatedBusinesses[index].isLoadingFunding = true;
    setBusinesses(updatedBusinesses);

    try {
      const response = await axios.post("/api/funding", {
        businessName: business.name,
        address: business.address,
      });

      if (response.data.success) {
        updatedBusinesses[index].funding = {
          totalFunding: response.data.totalFunding,
          fundingCount: response.data.fundingCount,
          funding: response.data.funding,
        };
        updatedBusinesses[index].isLoadingFunding = false;
        setBusinesses(updatedBusinesses);
        setSelectedBusiness(business.placeId);
      }
    } catch (err: any) {
      console.error("Error fetching funding:", err);
      updatedBusinesses[index].isLoadingFunding = false;
      updatedBusinesses[index].funding = {
        totalFunding: 0,
        fundingCount: 0,
        funding: [],
      };
      setBusinesses(updatedBusinesses);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Healthcare Funding Lookup</h1>
        <p className={styles.subtitle}>
          Find home healthcare businesses and their government funding
        </p>
      </div>

      <div className={styles.searchSection}>
        <div className={styles.searchBox}>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location (e.g., Aurora, CO)"
            className={styles.locationInput}
          />
          <button
            onClick={searchBusinesses}
            disabled={isLoading}
            className={styles.searchButton}
          >
            {isLoading ? "Searching..." : "Search Businesses"}
          </button>
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </div>

      <div className={styles.results}>
        {businesses.length > 0 && (
          <p className={styles.resultCount}>
            Found {businesses.length} home healthcare businesses in {location}
          </p>
        )}

        <div className={styles.businessList}>
          {businesses.map((business, index) => (
            <div key={business.placeId} className={styles.businessCard}>
              <div className={styles.businessHeader}>
                <h3 className={styles.businessName}>{business.name}</h3>
                {business.rating && (
                  <span className={styles.rating}>
                    ⭐ {business.rating} ({business.userRatingsTotal} reviews)
                  </span>
                )}
              </div>

              <p className={styles.address}>{business.address}</p>

              {business.businessStatus && (
                <span
                  className={`${styles.status} ${
                    business.businessStatus === "OPERATIONAL"
                      ? styles.statusActive
                      : styles.statusInactive
                  }`}
                >
                  {business.businessStatus}
                </span>
              )}

              <button
                onClick={() => fetchFunding(business, index)}
                disabled={business.isLoadingFunding}
                className={styles.fundingButton}
              >
                {business.isLoadingFunding
                  ? "Loading Funding Data..."
                  : business.funding
                  ? "Refresh Funding Data"
                  : "Check Government Funding"}
              </button>

              {business.funding && (
                <div className={styles.fundingSection}>
                  <div className={styles.fundingSummary}>
                    <h4>Funding Summary</h4>
                    <p className={styles.totalFunding}>
                      Total Funding: <strong>{formatCurrency(business.funding.totalFunding)}</strong>
                    </p>
                    <p className={styles.fundingCount}>
                      {business.funding.fundingCount} funding record(s) found
                    </p>
                  </div>

                  {business.funding.funding.length > 0 ? (
                    <div className={styles.fundingRecords}>
                      <h4>Funding Details</h4>
                      {business.funding.funding.map((record, recordIndex) => (
                        <div key={recordIndex} className={styles.fundingRecord}>
                          <div className={styles.recordHeader}>
                            <span className={styles.recordSource}>{record.source}</span>
                            <span className={styles.recordAmount}>
                              {formatCurrency(record.awardAmount)}
                            </span>
                          </div>
                          <p className={styles.recordRecipient}>
                            <strong>Recipient:</strong> {record.recipientName}
                          </p>
                          <p className={styles.recordAgency}>
                            <strong>Agency:</strong> {record.fundingAgency}
                          </p>
                          <p className={styles.recordType}>
                            <strong>Type:</strong> {record.awardType}
                          </p>
                          <p className={styles.recordDate}>
                            <strong>Date:</strong> {record.awardDate}
                          </p>
                          {record.description && (
                            <p className={styles.recordDescription}>
                              <strong>Description:</strong> {record.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.noFunding}>
                      No government funding records found for this business name.
                      This may mean the business hasn't received federal funding,
                      or operates under a different legal name.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
