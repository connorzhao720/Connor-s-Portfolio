import Link from "next/link";
import { notFound } from "next/navigation";
import { ChapterPageClient } from "../../components/ChapterPageClient";
import { chapters, getChapter, getChapterIndex } from "../../portfolio-data";

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
        <Link className="site-brand" href="/">
          <span aria-hidden="true" /> Connor&apos;s Portfolio
        </Link>
        <div className="site-nav-links">
          <Link href="/#about">About</Link>
          <Link href="/#chapters">Chapters</Link>
          <Link href="/#contact">Contact</Link>
        </div>
      </nav>
      <ChapterPageClient chapter={chapter} chapterIndex={chapterIndex} previous={previous} next={next} />
    </main>
  );
}
