"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartColumn, FileText, Info } from "lucide-react";
import styles from "./header.module.css";

export default function Header() {
  const pathname = usePathname();

  function isActive(path) {
    return pathname === path;
  }

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <ul className={styles.ul}>
          <li className={styles.li}>
            <Link
              href="/"
              className={`${styles.ancora} ${
                isActive("/") ? styles.active : ""
              }`}
            >
              <FileText />
              Home
            </Link>
          </li>

          <li className={styles.li}>
            <Link
              href="/dashboard"
              className={`${styles.ancora} ${styles.ancoraDesativa} ${
                isActive("/dashboard") ? styles.active : ""
              }`}
            >
              <ChartColumn />
              Dashboard
            </Link>
          </li>

          <li className={styles.li}>
            <Link
              href="/sobre"
              className={`${styles.ancora} ${styles.ancoraDesativa} ${
                isActive("/sobre") ? styles.active : ""
              }`}
            >
              <Info />
              Sobre
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
