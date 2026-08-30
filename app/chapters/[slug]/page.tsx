import { notFound } from "next/navigation";
import { ChapterPageClient } from "../../components/ChapterPageClient";
import { chapters, getChapter, getChapterIndex } from "../../portfolio-data";
import { sitePath } from "../../site-path";

export function generateStaticParams() {
  return chapters.map((chapter) => ({ slug: chapter.slug }));
}

export default async function ChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chapter = getChapter(slug);
  const chapterIndex = getChapterIndex(slug);

  if (!chapter || chapterIndex < 0) notFound();

  const previous = chapters[chapterIndex - 1];
  const next = chapters[chapterIndex + 1];

  return (
    <main className="portfolio-site illustrated-scene chapter-page">
      <nav className="site-nav chapter-nav" aria-label="Portfolio navigation">
        <a className="site-brand" href={sitePath("/")}>
          <span aria-hidden="true" /> Connor&apos;s Portfolio
        </a>
        <div className="site-nav-links">
          <a href={sitePath("/#about")}>About</a>
          <a href={sitePath("/#chapters")}>Chapters</a>
          <a href={sitePath("/#contact")}>Contact</a>
        </div>
      </nav>
      <ChapterPageClient chapter={chapter} chapterIndex={chapterIndex} previous={previous} next={next} />
    </main>
  );
}
