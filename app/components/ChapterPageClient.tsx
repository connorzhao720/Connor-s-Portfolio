"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ForestGate } from "./ForestGate";
import { chapters, storageKey, type Chapter } from "../portfolio-data";

type Props = {
  chapter: Chapter;
  chapterIndex: number;
  previous?: Chapter;
  next?: Chapter;
};

const readUnlockedCount = () => {
  const stored = Number(window.localStorage.getItem(storageKey) ?? "0");
  return Number.isFinite(stored) ? Math.max(0, Math.min(chapters.length, stored)) : 0;
};

export function ChapterPageClient({ chapter, chapterIndex, previous, next }: Props) {
  const [unlockedCount, setUnlockedCount] = useState(0);
  const isUnlocked = chapterIndex < unlockedCount;
  const canAttempt = chapterIndex <= unlockedCount;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setUnlockedCount(readUnlockedCount()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (!isUnlocked) {
    return (
      <section className="locked-page" aria-label={`${chapter.title} locked`}>
        <div className="locked-copy">
          <p className="eyebrow">{chapter.difficulty}</p>
          <h1>{chapter.title} is not open yet.</h1>
          <p>
            This is a full chapter page, but it stays closed until its short entry challenge is complete. The interaction
            is only the doorway; the portfolio is the destination.
          </p>
          {!canAttempt && <Link href="/">Return to chapters</Link>}
        </div>
        {canAttempt ? (
          <ForestGate chapter={chapter} chapterIndex={chapterIndex} onUnlocked={() => setUnlockedCount(readUnlockedCount())} />
        ) : (
          <div className="all-open-card">
            <h2>Earlier chapters are still locked.</h2>
            <p>Open the chapters in order from the home page.</p>
          </div>
        )}
      </section>
    );
  }

  return (
    <>
      <section className="chapter-hero-detail" aria-labelledby="chapter-title">
        <div>
          <p className="eyebrow">{chapter.difficulty}</p>
          <h1 id="chapter-title">{chapter.title}</h1>
          <p>{chapter.intro}</p>
        </div>
        <aside className="chapter-stats" aria-label="Chapter details">
          {chapter.stats.map((stat) => (
            <div key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </aside>
      </section>

      <section className="chapter-body" aria-label={`${chapter.title} content`}>
        <article className="chapter-writing">
          <h2>{chapter.title}</h2>
          {chapter.copy.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </article>

        <aside className="chapter-panels">
          {chapter.panels.map((panel, index) => (
            <div key={panel}>
              <span>0{index + 1}</span>
              <strong>{panel}</strong>
            </div>
          ))}
        </aside>
      </section>

      <section className="chapter-next" aria-label="Chapter navigation">
        {previous ? <Link href={previous.route}>Previous: {previous.title}</Link> : <Link href="/">Back to Chapters</Link>}
        {next ? <Link href={next.route}>Next: {next.title}</Link> : <Link href="/">Return Home</Link>}
      </section>
    </>
  );
}
