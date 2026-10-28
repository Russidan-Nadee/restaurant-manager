import { UtensilsCrossed } from "lucide-react";
import styles from "./RestaurantBrand.module.css";

export default function RestaurantBrand({ showIcon = true }: { showIcon?: boolean }) {
  return (
    <div className={styles.brand}>
      {showIcon && <span className={styles.mark}><UtensilsCrossed size={23} strokeWidth={1.75} aria-hidden="true" /></span>}
      <span className={styles.name} lang="en">Your name <strong>Restaurant</strong></span>
    </div>
  );
}
