import Link from "next/link";
import styles from "./navbar.module.css";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/log", label: "My Log" },
  { href: "/profile", label: "Profile" },
  { href: "/articles", label: "Articles" },
];

export default function Navbar() {
  return (
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="NutriCheck home">
        NutriCheck
      </Link>

      <nav className={styles.nav} aria-label="Main navigation">
        {navigationItems.map((item) => (
          <Link className={styles.navLink} href={item.href} key={item.label}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
