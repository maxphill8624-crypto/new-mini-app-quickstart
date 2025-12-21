import styles from "./ActivityFeed.module.css";

interface Activity {
  id: string;
  type: "transaction" | "login" | "update" | "achievement";
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  fullView?: boolean;
}

export function ActivityFeed({ activities, fullView = false }: ActivityFeedProps) {
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

  const getTypeColor = (type: Activity["type"]) => {
    switch (type) {
      case "transaction":
        return styles.transaction;
      case "login":
        return styles.login;
      case "update":
        return styles.update;
      case "achievement":
        return styles.achievement;
      default:
        return "";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Recent Activity</h3>
        {!fullView && <button className={styles.viewAll}>View All</button>}
      </div>
      <div className={styles.feed}>
        {activities.map((activity) => (
          <div key={activity.id} className={styles.activityItem}>
            <div className={`${styles.iconContainer} ${getTypeColor(activity.type)}`}>
              <span className={styles.icon}>{activity.icon}</span>
            </div>
            <div className={styles.content}>
              <h4 className={styles.activityTitle}>{activity.title}</h4>
              <p className={styles.description}>{activity.description}</p>
              <span className={styles.timestamp}>{formatTime(activity.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
