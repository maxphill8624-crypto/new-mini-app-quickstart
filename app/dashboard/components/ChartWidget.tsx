import styles from "./ChartWidget.module.css";

interface DataPoint {
  label: string;
  value: number;
}

interface ChartWidgetProps {
  title: string;
  data: DataPoint[];
  type?: "bar" | "area";
}

export function ChartWidget({ title, data, type = "bar" }: ChartWidgetProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.chart}>
        {data.map((point, index) => {
          const height = (point.value / maxValue) * 100;
          return (
            <div key={index} className={styles.barContainer}>
              <div className={styles.barWrapper}>
                <div
                  className={type === "area" ? styles.areaBar : styles.bar}
                  style={{ height: `${height}%` }}
                >
                  <span className={styles.value}>{point.value.toLocaleString()}</span>
                </div>
              </div>
              <span className={styles.label}>{point.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
