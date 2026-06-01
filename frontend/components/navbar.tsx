"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getUsername, getRole, clearSession, isLoggedIn } from "@/lib/api";
import styles from "./navbar.module.css";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/log",       label: "Log"       },
  { href: "/profile",   label: "Profile"   },
  { href: "/articles",  label: "Articles"  },
];

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();

  const [username, setUsername]     = useState("");
  const [role, setRole]             = useState<"user" | "nutritionist">("user");
  const [dropdownOpen, setDropdown] = useState(false);
  const dropdownRef                 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoggedIn()) {
      setUsername(getUsername());
      setRole(getRole());
    }
  }, [pathname]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  const initials = username ? username.charAt(0).toUpperCase() : "?";

  return (
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="NutriCheck home">
        NutriCheck
      </Link>

      <nav className={styles.nav} aria-label="Main navigation">
        {navigationItems.map((item) => (
          <Link
            className={`${styles.navLink} ${pathname.startsWith(item.href) ? styles.navLinkActive : ""}`}
            href={item.href}
            key={item.label}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className={styles.avatarWrap} ref={dropdownRef}>
        <button
          className={styles.avatar}
          onClick={() => setDropdown(v => !v)}
          aria-label="Account menu"
        >
          {initials}
        </button>

        {dropdownOpen && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownHeader}>
              <p className={styles.dropdownName}>{username || "Guest"}</p>
              <span className={styles.dropdownRole}>
                {role === "nutritionist" ? "Nutritionist" : "User"}
              </span>
            </div>

            <div className={styles.dropdownDivider} />

            <Link
              href="/profile"
              className={styles.dropdownItem}
              onClick={() => setDropdown(false)}
            >
              My Profile
            </Link>

            {role === "nutritionist" && (
              <Link
                href="/articles/new"
                className={styles.dropdownItem}
                onClick={() => setDropdown(false)}
              >
                Write Article
              </Link>
            )}

            <div className={styles.dropdownDivider} />

            <button
              className={`${styles.dropdownItem} ${styles.logoutBtn}`}
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}