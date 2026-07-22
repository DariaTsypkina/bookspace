import Link from 'next/link';
import {
  CONTEXT_READING_DISCLAIMER,
  type PublicContextReadingItem,
} from '@/lib/catalog-context-reading';

type WorkContextReadingSectionProps = {
  items: PublicContextReadingItem[];
};

export type WorkContextReadingSectionContent = {
  heading: string;
  disclaimer: string;
  items: Array<{
    slug: string;
    titleRu: string;
    whyText: string;
  }>;
};

export function shouldShowWorkContextReadingSection(
  items: PublicContextReadingItem[],
): boolean {
  return items.length > 0;
}

export function getWorkContextReadingSectionContent(
  items: PublicContextReadingItem[],
): WorkContextReadingSectionContent | null {
  if (items.length === 0) {
    return null;
  }

  return {
    heading: 'Для понимания',
    disclaimer: CONTEXT_READING_DISCLAIMER,
    items: items.map((item) => ({
      slug: item.recommendedWork.slug,
      titleRu: item.recommendedWork.titleRu,
      whyText: item.whyText,
    })),
  };
}

export function WorkContextReadingSection({
  items,
}: WorkContextReadingSectionProps) {
  const content = getWorkContextReadingSectionContent(items);

  if (!content) {
    return null;
  }

  return (
    <section className="work-context-reading" aria-label="Для понимания">
      <h2>{content.heading}</h2>
      <p className="work-context-reading-disclaimer">{content.disclaimer}</p>
      <ul>
        {content.items.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/books/${item.slug}`}
              className="work-context-reading-title"
            >
              {item.titleRu}
            </Link>
            <p className="work-context-reading-why">{item.whyText}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
