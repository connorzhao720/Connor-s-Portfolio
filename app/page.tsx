"use client";

import { useEffect, useMemo, useState } from "react";
import { ForestGate } from "./components/ForestGate";
import { chapters, storageKey } from "./portfolio-data";
import { sitePath } from "./site-path";

const readUnlockedCount = () => {
  if (typeof window === "undefined") return 0;
  const stored = Number(window.localStorage.getItem(storageKey) ?? "0");
  return Number.isFinite(stored) ? Math.max(0, Math.min(chapters.length, stored)) : 0;
};

export default function Home() {
  const [unlockedCount, setUnlockedCount] = useState(0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setUnlockedCount(readUnlockedCount()));
    const onStorage = () => setUnlockedCount(readUnlockedCount());
    window.addEventListener("storage", onStorage);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const nextChapter = useMemo(() => chapters[Math.min(unlockedCount, chapters.length - 1)], [unlockedCount]);
  const nextIndex = Math.min(unlockedCount, chapters.length - 1);
  const explored = Math.round((unlockedCount / chapters.length) * 100);

  const resetJourney = () => {
    window.localStorage.removeItem(storageKey);
    setUnlockedCount(0);
  };

  return (
    <main className="portfolio-site illustrated-scene">
      <nav className="site-nav" aria-label="Main navigation">
        <a className="site-brand" href={sitePath("/")} aria-label="Connor's Portfolio home">
          <span aria-hidden="true" /> Connor&apos;s Portfolio
        </a>
        <div className="site-nav-links">
          <a href="#about">About</a>
          <a href="#chapters">Chapters</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>
      <section className="portfolio-hero" aria-labelledby="site-title">
        <div className="hero-text">
          <p className="eyebrow">Personal portfolio</p>
          <h1 id="site-title"><span>Connor&apos;s</span><span>Portfolio</span></h1>
          <p>
            A personal portfolio told through five chapters: the work, ideas, and experiences that shaped how I think and what I make.
          </p>
          <div className="hero-actions">
            <a href="#chapters">Explore Chapters</a>
            {unlockedCount > 0 ? <a href={sitePath(chapters[unlockedCount - 1].route)}>Continue Reading</a> : <a href="#gate">Begin</a>}
          </div>
        </div>
        <aside className="profile-note" aria-label="Portfolio overview">
          <span>{explored}% complete</span>
          <h2>A portfolio with a little momentum.</h2>
          <p>
            Each chapter opens on its own page. The short interactive challenges are simply a memorable way to move forward.
          </p>
          <button type="button" onClick={resetJourney}>Reset Journey</button>
        </aside>
      </section>

      <section className="portfolio-intro" id="about" aria-label="About Connor">
        <div>
          <p className="eyebrow">About</p>
          <h2>Thoughtful work, told in chapters.</h2>
        </div>
        <p>
          Replace this placeholder with a concise personal introduction: who you are, what you build, what you care
          about, and why someone should keep reading. Each page is built to make your story and your work easy to follow.
        </p>
      </section>

      <section className="chapter-index" id="chapters" aria-label="Portfolio chapters">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Chapters</p>
            <h2>Every part of the story has its own page.</h2>
          </div>
          <p>Unlocked pages open directly. The next page asks for one compact interactive challenge.</p>
        </div>

        <div className="chapter-grid">
          {chapters.map((chapter, index) => {
            const isUnlocked = index < unlockedCount;
            const isNext = index === unlockedCount;
            return (
              <article className={`portfolio-chapter-card ${isUnlocked ? "unlocked" : ""}`} key={chapter.slug}>
                <span>{chapter.difficulty}</span>
                <h3>{chapter.title}</h3>
                <p>{chapter.subtitle}</p>
                <div className="chapter-card-footer">
                  <strong>{chapter.difficulty}</strong>
                  {isUnlocked ? (
                    <a href={sitePath(chapter.route)}>Read Page</a>
                  ) : isNext ? (
                    <a href="#gate">Open Chapter</a>
                  ) : (
                    <em>Locked</em>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="gate-section" id="gate" aria-label="Chapter unlock interaction">
        <div className="gate-section-copy">
          <p className="eyebrow">Continue</p>
          <h2>{unlockedCount >= chapters.length ? "All chapters are open" : `Unlock ${nextChapter.title}`}</h2>
          <p>
            Clear this brief challenge to continue. It is designed as navigation, keeping the focus on the portfolio itself.
          </p>
        </div>
        {unlockedCount >= chapters.length ? (
          <div className="all-open-card">
            <h3>Everything is open.</h3>
            <p>Every chapter page is unlocked. You can move through the portfolio in any order.</p>
            <a href={sitePath(chapters[0].route)}>Start Reading</a>
          </div>
        ) : (
          <ForestGate chapter={nextChapter} chapterIndex={nextIndex} compact onUnlocked={() => setUnlockedCount(readUnlockedCount())} />
        )}
      </section>
      <footer className="site-footer" id="contact">
        <span>Connor&apos;s Portfolio</span>
        <a href="mailto:hello@example.com">hello@example.com</a>
      </footer>
    </main>
  );
}
