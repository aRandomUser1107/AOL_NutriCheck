import styles from "./footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.copy}>Copyright &copy; 2026. All rights reserved.</p>
      <p className={styles.brand}>NutriCheck</p>
    </footer>
  );
}
