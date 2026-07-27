import Link from 'next/link';
import {
  CONTEXT_READING_DISCLAIMER,
  type PublicContextReadingItem,
} from '@/lib/catalog-context-reading';
import { Card, CardContent } from '@/components/ui/card';

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
    <section aria-label="Для понимания">
      <h2 className="mb-2 font-sans text-[1.15rem] font-medium text-foreground">
        {content.heading}
      </h2>
      <p className="mb-3 font-sans text-[0.9rem] leading-snug text-muted">
        {content.disclaimer}
      </p>
      <ul className="flex list-none flex-col gap-3 p-0">
        {content.items.map((item) => (
          <li key={item.slug}>
            <Card>
              <CardContent className="flex flex-col gap-1.5 px-4 py-3.5 font-sans text-[0.95rem]">
                <Link
                  href={`/books/${item.slug}`}
                  className="font-medium text-foreground no-underline hover:underline"
                >
                  {item.titleRu}
                </Link>
                <p className="leading-snug text-muted">{item.whyText}</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
