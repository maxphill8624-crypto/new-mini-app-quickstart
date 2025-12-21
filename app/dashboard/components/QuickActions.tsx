import styles from "./QuickActions.module.css";

export function QuickActions() {
  const actions = [
    { icon: "➕", label: "Create New", color: "#667eea" },
    { icon: "📊", label: "View Reports", color: "#48bb78" },
    { icon: "👥", label: "Manage Users", color: "#ed8936" },
    { icon: "⚙️", label: "Settings", color: "#718096" },
  ];

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Quick Actions</h3>
      <div className={styles.actions}>
        {actions.map((action, index) => (
          <button
            key={index}
            className={styles.actionButton}
            style={{ borderColor: action.color }}
          >
            <span className={styles.icon}>{action.icon}</span>
            <span className={styles.label}>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
