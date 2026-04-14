"use client";
import { useState, useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import styles from "./page.module.css";

export default function Home() {
  const { isFrameReady, setFrameReady, context } = useMiniKit();
  const [activeSection, setActiveSection] = useState("hero");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const displayName = context?.user?.displayName || "Visitor";

  const skills = [
    { name: "Blockchain", level: 95 },
    { name: "React / Next.js", level: 90 },
    { name: "Solidity", level: 85 },
    { name: "TypeScript", level: 88 },
    { name: "Node.js", level: 82 },
    { name: "Web3 / DeFi", level: 92 },
  ];

  const projects = [
    {
      title: "Cubey AI",
      tag: "AI · Ads",
      description:
        "AI-powered crypto marketing strategy tool that generates, optimizes, and targets Web3 ad campaigns across Farcaster and beyond.",
      accent: "#7c6fff",
    },
    {
      title: "DeFi Dashboard",
      tag: "DeFi · Analytics",
      description:
        "Real-time portfolio tracker aggregating assets across 12+ EVM chains with yield-optimization suggestions.",
      accent: "#00d2ff",
    },
    {
      title: "On-chain Identity",
      tag: "Identity · NFT",
      description:
        "Decentralized profile system linking Farcaster IDs, ENS names, and on-chain reputation into a single verifiable identity.",
      accent: "#f7d954",
    },
  ];

  const nav = ["About", "Skills", "Projects", "Contact"];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveSection(id.toLowerCase());
    setMenuOpen(false);
  };

  return (
    <div className={styles.page}>
      {/* ── Navigation ── */}
      <nav className={styles.nav}>
        <span className={styles.logo}>MP</span>

        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span className={menuOpen ? styles.barOpen : styles.bar} />
          <span className={menuOpen ? styles.barOpenMid : styles.bar} />
          <span className={menuOpen ? styles.barOpenBot : styles.bar} />
        </button>

        <ul className={`${styles.navLinks} ${menuOpen ? styles.navOpen : ""}`}>
          {nav.map((n) => (
            <li key={n}>
              <button
                className={`${styles.navLink} ${
                  activeSection === n.toLowerCase() ? styles.navLinkActive : ""
                }`}
                onClick={() => scrollTo(n.toLowerCase())}
              >
                {n}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Hero ── */}
      <section id="hero" className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.orb1} />
          <div className={styles.orb2} />
          <div className={styles.orb3} />
          <div className={styles.grid} />
        </div>

        <div className={styles.heroContent}>
          <p className={styles.greeting}>
            Hey {displayName}, welcome to my world
          </p>
          <h1 className={styles.heroName}>
            Max<br />
            <span className={styles.heroNameAccent}>Phillips</span>
          </h1>
          <p className={styles.heroRole}>
            Full-Stack Engineer · Web3 Builder · DeFi Enthusiast
          </p>
          <p className={styles.heroBio}>
            I craft seamless on-chain products — from smart contracts to slick
            UIs — that make crypto feel like magic for everyday users.
          </p>
          <div className={styles.heroCta}>
            <button className={styles.ctaPrimary} onClick={() => scrollTo("projects")}>
              View My Work
            </button>
            <button className={styles.ctaSecondary} onClick={() => scrollTo("contact")}>
              Get In Touch
            </button>
          </div>
        </div>

        <div className={styles.scrollHint}>
          <span className={styles.scrollDot} />
          <span>Scroll</span>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>01 — About</div>
          <h2 className={styles.sectionTitle}>Building the open web,<br />one block at a time.</h2>

          <div className={styles.aboutGrid}>
            <div className={styles.aboutText}>
              <p>
                I'm a full-stack engineer with 6+ years turning ambitious ideas
                into production-grade Web3 products. I love working at the
                intersection of great UX and decentralised infrastructure.
              </p>
              <p>
                When I'm not shipping features, you'll find me contributing to
                open-source, writing about DeFi mechanics, or hunting for the
                next great on-chain game.
              </p>
              <div className={styles.badges}>
                {["Base", "Ethereum", "Farcaster", "Solidity", "Next.js"].map((b) => (
                  <span key={b} className={styles.badge}>{b}</span>
                ))}
              </div>
            </div>

            <div className={styles.statGrid}>
              {[
                { n: "6+", label: "Years experience" },
                { n: "30+", label: "Projects shipped" },
                { n: "12", label: "Chains deployed" },
                { n: "∞", label: "Coffee consumed" },
              ].map((s) => (
                <div key={s.label} className={styles.statCard}>
                  <span className={styles.statNum}>{s.n}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Skills ── */}
      <section id="skills" className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>02 — Skills</div>
          <h2 className={styles.sectionTitle}>What I bring<br />to the table.</h2>

          <div className={styles.skillsList}>
            {skills.map((s) => (
              <div key={s.name} className={styles.skillRow}>
                <div className={styles.skillMeta}>
                  <span className={styles.skillName}>{s.name}</span>
                  <span className={styles.skillPct}>{s.level}%</span>
                </div>
                <div className={styles.skillTrack}>
                  <div
                    className={styles.skillFill}
                    style={{ width: `${s.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Projects ── */}
      <section id="projects" className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>03 — Projects</div>
          <h2 className={styles.sectionTitle}>Things I've<br />shipped.</h2>

          <div className={styles.projectGrid}>
            {projects.map((p) => (
              <div key={p.title} className={styles.projectCard}>
                <div
                  className={styles.projectAccentLine}
                  style={{ background: p.accent }}
                />
                <span className={styles.projectTag}>{p.tag}</span>
                <h3 className={styles.projectTitle}>{p.title}</h3>
                <p className={styles.projectDesc}>{p.description}</p>
                <button
                  className={styles.projectLink}
                  style={{ color: p.accent }}
                >
                  View case study →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>04 — Contact</div>
          <h2 className={styles.sectionTitle}>Let's build<br />something great.</h2>

          <div className={styles.contactGrid}>
            <p className={styles.contactIntro}>
              Whether you have a project in mind, want to collaborate, or just
              want to say hi — my inbox is always open.
            </p>

            <div className={styles.contactLinks}>
              {[
                { label: "Email", value: "max@example.com", href: "mailto:max@example.com" },
                { label: "Farcaster", value: "@maxphillips", href: "#" },
                { label: "GitHub", value: "maxphill8624-crypto", href: "#" },
                { label: "Twitter / X", value: "@maxphillips", href: "#" },
              ].map((c) => (
                <a key={c.label} href={c.href} className={styles.contactItem}>
                  <span className={styles.contactLabel}>{c.label}</span>
                  <span className={styles.contactValue}>{c.value}</span>
                </a>
              ))}
            </div>
          </div>

          <a href="mailto:max@example.com" className={styles.bigCta}>
            Send me a message
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <span>© 2026 Max Phillips — Built on Base</span>
        <span className={styles.footerRight}>Made with Next.js · MiniKit</span>
      </footer>
    </div>
  );
}
