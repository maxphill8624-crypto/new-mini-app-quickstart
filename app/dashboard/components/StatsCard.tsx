import styles from "./StatsCard.module.css";

interface StatsCardProps {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

export function StatsCard({ label, value, change, trend }: StatsCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.label}>{label}</h3>
        <span className={`${styles.trend} ${styles[trend]}`}>
          {trend === "up" ? "↗" : "↘"}
        </span>
      </div>
      <p className={styles.value}>{value}</p>
      <div className={styles.footer}>
        <span className={`${styles.change} ${trend === "up" ? styles.positive : styles.negative}`}>
          {change}
        </span>
        <span className={styles.period}>vs last period</span>
      </div>
    </div>
  );
}
