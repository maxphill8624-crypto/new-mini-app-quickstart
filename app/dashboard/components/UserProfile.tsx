import styles from "./UserProfile.module.css";

interface UserProfileProps {
  username: string;
  fid?: number;
  pfpUrl?: string;
}

export function UserProfile({ username, fid, pfpUrl }: UserProfileProps) {
  return (
    <div className={styles.profile}>
      <div className={styles.info}>
        <p className={styles.username}>{username}</p>
        {fid && <p className={styles.fid}>FID: {fid}</p>}
      </div>
      <div className={styles.avatar}>
        {pfpUrl ? (
          <img src={pfpUrl} alt={username} className={styles.avatarImg} />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {username.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
