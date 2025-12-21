"use client";
import { useState, useEffect } from "react";
import { useQuickAuth, useMiniKit } from "@coinbase/onchainkit/minikit";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";
import { StatsCard } from "./components/StatsCard";
import { ActivityFeed } from "./components/ActivityFeed";
import { ChartWidget } from "./components/ChartWidget";
import { UserProfile } from "./components/UserProfile";
import { QuickActions } from "./components/QuickActions";

interface AuthResponse {
  success: boolean;
  user?: {
    fid: number;
    issuedAt?: number;
    expiresAt?: number;
  };
  message?: string;
}

interface Activity {
  id: string;
  type: "transaction" | "login" | "update" | "achievement";
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
}

export default function Dashboard() {
  const { isFrameReady, setFrameReady, context } = useMiniKit();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "activity" | "settings">("overview");
  const [activities, setActivities] = useState<Activity[]>([]);

  const { data: authData, isLoading: isAuthLoading } = useQuickAuth<AuthResponse>(
    "/api/auth",
    { method: "GET" }
  );

  // Initialize the miniapp
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Mock activity data
  useEffect(() => {
    const mockActivities: Activity[] = [
      {
        id: "1",
        type: "login",
        title: "Successful Login",
        description: "You logged in from Farcaster",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        icon: "🔐",
      },
      {
        id: "2",
        type: "achievement",
        title: "First Dashboard Visit",
        description: "Welcome to your new dashboard!",
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        icon: "🎉",
      },
      {
        id: "3",
        type: "update",
        title: "Profile Updated",
        description: "Your profile information was synced",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        icon: "✏️",
      },
      {
        id: "4",
        type: "transaction",
        title: "New Transaction",
        description: "Received 0.5 ETH",
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        icon: "💰",
      },
    ];
    setActivities(mockActivities);
  }, []);

  // Mock statistics data
  const stats = [
    { label: "Total Users", value: "12,458", change: "+12.5%", trend: "up" },
    { label: "Active Sessions", value: "3,421", change: "+8.2%", trend: "up" },
    { label: "Revenue", value: "$45,231", change: "+23.1%", trend: "up" },
    { label: "Engagement Rate", value: "68.4%", change: "-2.3%", trend: "down" },
  ];

  if (isAuthLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>📊</div>
          <h2>Dashboard</h2>
        </div>

        <nav className={styles.nav}>
          <button
            className={`${styles.navItem} ${activeTab === "overview" ? styles.active : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <span className={styles.navIcon}>🏠</span>
            Overview
          </button>
          <button
            className={`${styles.navItem} ${activeTab === "analytics" ? styles.active : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            <span className={styles.navIcon}>📈</span>
            Analytics
          </button>
          <button
            className={`${styles.navItem} ${activeTab === "activity" ? styles.active : ""}`}
            onClick={() => setActiveTab("activity")}
          >
            <span className={styles.navIcon}>⚡</span>
            Activity
          </button>
          <button
            className={`${styles.navItem} ${activeTab === "settings" ? styles.active : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <span className={styles.navIcon}>⚙️</span>
            Settings
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <button onClick={() => router.push("/")} className={styles.backButton}>
            ← Back to Home
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <p className={styles.pageSubtitle}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </p>
          </div>
          <UserProfile
            username={context?.user?.displayName || context?.user?.username || "Anonymous"}
            fid={authData?.user?.fid || context?.user?.fid}
            pfpUrl={context?.user?.pfpUrl}
          />
        </header>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className={styles.content}>
            {/* Quick Actions */}
            <QuickActions />

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
              {stats.map((stat, index) => (
                <StatsCard
                  key={index}
                  label={stat.label}
                  value={stat.value}
                  change={stat.change}
                  trend={stat.trend as "up" | "down"}
                />
              ))}
            </div>

            {/* Charts and Activity */}
            <div className={styles.chartsGrid}>
              <div className={styles.chartSection}>
                <ChartWidget
                  title="User Growth"
                  data={[
                    { label: "Mon", value: 245 },
                    { label: "Tue", value: 312 },
                    { label: "Wed", value: 189 },
                    { label: "Thu", value: 421 },
                    { label: "Fri", value: 367 },
                    { label: "Sat", value: 289 },
                    { label: "Sun", value: 198 },
                  ]}
                />
              </div>
              <div className={styles.activitySection}>
                <ActivityFeed activities={activities} />
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className={styles.content}>
            <div className={styles.analyticsGrid}>
              <div className={styles.analyticsCard}>
                <h3>Performance Metrics</h3>
                <ChartWidget
                  title="Revenue Over Time"
                  data={[
                    { label: "Jan", value: 42000 },
                    { label: "Feb", value: 38000 },
                    { label: "Mar", value: 45000 },
                    { label: "Apr", value: 52000 },
                    { label: "May", value: 48000 },
                    { label: "Jun", value: 55000 },
                  ]}
                  type="area"
                />
              </div>
              <div className={styles.analyticsCard}>
                <h3>User Engagement</h3>
                <ChartWidget
                  title="Daily Active Users"
                  data={[
                    { label: "Week 1", value: 3200 },
                    { label: "Week 2", value: 3450 },
                    { label: "Week 3", value: 3100 },
                    { label: "Week 4", value: 3800 },
                  ]}
                />
              </div>
            </div>
            <div className={styles.statsGrid}>
              <div className={styles.metricCard}>
                <h4>Conversion Rate</h4>
                <p className={styles.metricValue}>4.8%</p>
                <span className={styles.metricChange}>+0.5% from last week</span>
              </div>
              <div className={styles.metricCard}>
                <h4>Avg. Session Duration</h4>
                <p className={styles.metricValue}>8m 32s</p>
                <span className={styles.metricChange}>+1m 12s from last week</span>
              </div>
              <div className={styles.metricCard}>
                <h4>Bounce Rate</h4>
                <p className={styles.metricValue}>32.1%</p>
                <span className={styles.metricChange}>-3.2% from last week</span>
              </div>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <div className={styles.content}>
            <div className={styles.activityFull}>
              <ActivityFeed activities={activities} fullView />
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className={styles.content}>
            <div className={styles.settingsContainer}>
              <section className={styles.settingsSection}>
                <h3>Account Settings</h3>
                <div className={styles.settingItem}>
                  <label>Display Name</label>
                  <input
                    type="text"
                    value={context?.user?.displayName || ""}
                    disabled
                    className={styles.input}
                  />
                </div>
                <div className={styles.settingItem}>
                  <label>Farcaster ID (FID)</label>
                  <input
                    type="text"
                    value={authData?.user?.fid || context?.user?.fid || "Not available"}
                    disabled
                    className={styles.input}
                  />
                </div>
              </section>

              <section className={styles.settingsSection}>
                <h3>Preferences</h3>
                <div className={styles.settingItem}>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" defaultChecked />
                    <span>Enable notifications</span>
                  </label>
                </div>
                <div className={styles.settingItem}>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" defaultChecked />
                    <span>Email updates</span>
                  </label>
                </div>
                <div className={styles.settingItem}>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" />
                    <span>Dark mode</span>
                  </label>
                </div>
              </section>

              <section className={styles.settingsSection}>
                <h3>Data & Privacy</h3>
                <button className={styles.dangerButton}>Delete Account</button>
                <button className={styles.secondaryButton}>Export Data</button>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
