import Image from "next/image";
import styles from "./BrandMark.module.css";

export default function BrandMark({ size = 48 }: { size?: number }) {
  return (
    <>
      <Image
        src="/logo.webp"
        alt=""
        width={size}
        height={size}
        className={styles.icon}
        unoptimized
        loading="eager"
        fetchPriority="high"
      />
      <span className={styles.wordmark}>
        <span className={styles.name}>Smart Tracker</span>
        <small>Telematics</small>
      </span>
    </>
  );
}
