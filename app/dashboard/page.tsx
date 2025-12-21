"use client";
import { useState, useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useQuickAuth } from "@coinbase/onchainkit/minikit";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

interface AuthResponse {
  success: boolean;
  user?: {
    fid: number;
    issuedAt?: number;
    expiresAt?: number;
  };
  message?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: string;
}

interface ActivityItem {
  id: string;
  type: "transaction" | "achievement" | "social" | "system";
  title: string;
  description: string;
  timestamp: Date;
  icon?: string;
}

const StatCard = ({ title, value, change, trend, icon }: StatCardProps) => (
  <div className={styles.statCard}>
    <div className={styles.statHeader}>
      <span className={styles.statIcon}>{icon || "📊"}</span>
      <h3 className={styles.statTitle}>{title}</h3>
    </div>
    <div className={styles.statValue}>{value}</div>
    {change && (
      <div className={`${styles.statChange} ${styles[trend || "neutral"]}`}>
        {trend === "up" ? "↗" : trend === "down" ? "↘" : "→"} {change}
      </div>
    )}
  </div>
);

const ActivityFeedItem = ({ item }: { item: ActivityItem }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "transaction":
        return styles.transaction;
      case "achievement":
        return styles.achievement;
      case "social":
        return styles.social;
      default:
        return styles.system;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  return (
    <div className={`${styles.activityItem} ${getTypeColor(item.type)}`}>
      <div className={styles.activityIcon}>{item.icon || "•"}</div>
      <div className={styles.activityContent}>
        <h4 className={styles.activityTitle}>{item.title}</h4>
        <p className={styles.activityDescription}>{item.description}</p>
        <span className={styles.activityTime}>{formatTime(item.timestamp)}</span>
      </div>
    </div>
  );
};

const ProgressChart = ({ label, value, max }: { label: string; value: number; max: number }) => {
  const percentage = (value / max) * 100;

  return (
    <div className={styles.progressChart}>
      <div className={styles.progressHeader}>
        <span className={styles.progressLabel}>{label}</span>
        <span className={styles.progressValue}>{value} / {max}</span>
      </div>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { isFrameReady, setFrameReady, context } = useMiniKit();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "wallet">("overview");

  const { data: authData, isLoading: isAuthLoading } = useQuickAuth<AuthResponse>(
    "/api/auth",
    { method: "GET" }
  );

  // Mock data - replace with real data from your API
  const [stats] = useState([
    { title: "Total Balance", value: "$12,345.67", change: "+12.5%", trend: "up" as const, icon: "💰" },
    { title: "Transactions", value: "156", change: "+8", trend: "up" as const, icon: "📈" },
    { title: "Active Frames", value: "23", change: "0", trend: "neutral" as const, icon: "🖼️" },
    { title: "Followers", value: "1,234", change: "+42", trend: "up" as const, icon: "👥" },
  ]);

  const [activities] = useState<ActivityItem[]>([
    {
      id: "1",
      type: "transaction",
      title: "Received 0.5 ETH",
      description: "From 0x1234...5678",
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      icon: "💸",
    },
    {
      id: "2",
      type: "achievement",
      title: "Achievement Unlocked!",
      description: "Completed 100 transactions",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      icon: "🏆",
    },
    {
      id: "3",
      type: "social",
      title: "New Follower",
      description: "@cryptofan followed you",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      icon: "👤",
    },
    {
      id: "4",
      type: "transaction",
      title: "Sent 100 USDC",
      description: "To 0xabcd...ef01",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      icon: "💵",
    },
    {
      id: "5",
      type: "system",
      title: "Profile Updated",
      description: "You updated your profile picture",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
      icon: "⚙️",
    },
  ]);

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const handleQuickAction = (action: string) => {
    console.log("Quick action:", action);
    // Implement quick actions here
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {context?.user?.pfpUrl ? (
                <img src={context.user.pfpUrl} alt="Profile" />
              ) : (
                <span>👤</span>
              )}
            </div>
            <div className={styles.userDetails}>
              <h1 className={styles.userName}>
                {context?.user?.displayName || "Welcome"}
              </h1>
              <p className={styles.userFid}>
                {authData?.user?.fid ? `FID: ${authData.user.fid}` : "Loading..."}
              </p>
            </div>
          </div>
          <button
            className={styles.closeButton}
            onClick={() => router.push("/")}
            type="button"
          >
            ✕
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "overview" ? styles.active : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`${styles.tab} ${activeTab === "activity" ? styles.active : ""}`}
          onClick={() => setActiveTab("activity")}
        >
          Activity
        </button>
        <button
          className={`${styles.tab} ${activeTab === "wallet" ? styles.active : ""}`}
          onClick={() => setActiveTab("wallet")}
        >
          Wallet
        </button>
      </nav>

      {/* Main Content */}
      <main className={styles.main}>
        {activeTab === "overview" && (
          <>
            {/* Stats Grid */}
            <section className={styles.statsGrid}>
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </section>

            {/* Quick Actions */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Quick Actions</h2>
              <div className={styles.quickActions}>
                <button
                  className={styles.actionButton}
                  onClick={() => handleQuickAction("send")}
                >
                  <span className={styles.actionIcon}>📤</span>
                  <span>Send</span>
                </button>
                <button
                  className={styles.actionButton}
                  onClick={() => handleQuickAction("receive")}
                >
                  <span className={styles.actionIcon}>📥</span>
                  <span>Receive</span>
                </button>
                <button
                  className={styles.actionButton}
                  onClick={() => handleQuickAction("swap")}
                >
                  <span className={styles.actionIcon}>🔄</span>
                  <span>Swap</span>
                </button>
                <button
                  className={styles.actionButton}
                  onClick={() => handleQuickAction("bridge")}
                >
                  <span className={styles.actionIcon}>🌉</span>
                  <span>Bridge</span>
                </button>
              </div>
            </section>

            {/* Progress Section */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Your Progress</h2>
              <div className={styles.progressSection}>
                <ProgressChart label="Daily Goals" value={7} max={10} />
                <ProgressChart label="Weekly Transactions" value={23} max={50} />
                <ProgressChart label="Profile Completion" value={85} max={100} />
              </div>
            </section>
          </>
        )}

        {activeTab === "activity" && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Recent Activity</h2>
            <div className={styles.activityFeed}>
              {activities.map((activity) => (
                <ActivityFeedItem key={activity.id} item={activity} />
              ))}
            </div>
          </section>
        )}

        {activeTab === "wallet" && (
          <>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Wallet Overview</h2>
              <div className={styles.walletCard}>
                <div className={styles.walletBalance}>
                  <span className={styles.balanceLabel}>Total Balance</span>
                  <span className={styles.balanceValue}>$12,345.67</span>
                  <span className={styles.balanceChange}>+$1,234.56 (11.1%)</span>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Assets</h2>
              <div className={styles.assetsList}>
                <div className={styles.assetItem}>
                  <div className={styles.assetInfo}>
                    <span className={styles.assetIcon}>Ξ</span>
                    <div>
                      <div className={styles.assetName}>Ethereum</div>
                      <div className={styles.assetAmount}>2.5 ETH</div>
                    </div>
                  </div>
                  <div className={styles.assetValue}>
                    <div className={styles.assetUsd}>$6,250.00</div>
                    <div className={`${styles.assetChange} ${styles.up}`}>+5.2%</div>
                  </div>
                </div>

                <div className={styles.assetItem}>
                  <div className={styles.assetInfo}>
                    <span className={styles.assetIcon}>💵</span>
                    <div>
                      <div className={styles.assetName}>USDC</div>
                      <div className={styles.assetAmount}>5,000 USDC</div>
                    </div>
                  </div>
                  <div className={styles.assetValue}>
                    <div className={styles.assetUsd}>$5,000.00</div>
                    <div className={`${styles.assetChange} ${styles.neutral}`}>0.0%</div>
                  </div>
                </div>

                <div className={styles.assetItem}>
                  <div className={styles.assetInfo}>
                    <span className={styles.assetIcon}>🔵</span>
                    <div>
                      <div className={styles.assetName}>BASE</div>
                      <div className={styles.assetAmount}>1,000 BASE</div>
                    </div>
                  </div>
                  <div className={styles.assetValue}>
                    <div className={styles.assetUsd}>$1,095.67</div>
                    <div className={`${styles.assetChange} ${styles.up}`}>+15.8%</div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
