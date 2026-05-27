type HeadingLevel = 1 | 2 | 3 | 4;

export type HeadingItem = {
  id: string;
  text: string;
  level: HeadingLevel;
};

type TableOfContentsProps = {
  headings: HeadingItem[];
  variant?: "mobile" | "desktop";
};

const headingPattern = /<h([1-4])([^>]*)>([\s\S]*?)<\/h\1>/gi;
const tagPattern = /<[^>]+>/g;
const idPattern = /\s+id=(["'])(.*?)\1/i;

const basicEntities: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

function decodeBasicEntities(value: string) {
  return value.replace(
    /&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g,
    (entity) => basicEntities[entity] ?? entity,
  );
}

function stripHtml(value: string) {
  return decodeBasicEntities(value.replace(tagPattern, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function slugifyHeading(value: string) {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^0-9A-Za-z\u4e00-\u9fa5\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

  return slug || "section";
}

export function decoratePostContent(content: string) {
  const seenIds = new Map<string, number>();
  const headings: HeadingItem[] = [];

  const html = content.replace(
    headingPattern,
    (fullMatch, levelValue: string, attributes: string, innerHtml: string) => {
      const text = stripHtml(innerHtml);

      if (!text) {
        return fullMatch;
      }

      const level = Number(levelValue) as HeadingLevel;
      const currentId = attributes.match(idPattern)?.[2] ?? slugifyHeading(text);
      const duplicateCount = seenIds.get(currentId) ?? 0;
      const nextCount = duplicateCount + 1;
      seenIds.set(currentId, nextCount);

      const id = duplicateCount === 0 ? currentId : `${currentId}-${nextCount}`;
      const normalizedAttributes = attributes.replace(idPattern, "");

      headings.push({ id, text, level });

      return `<h${levelValue}${normalizedAttributes} id="${id}">${innerHtml}</h${levelValue}>`;
    },
  );

  return { html, headings };
}

function renderHeadingLinks(headings: HeadingItem[]) {
  return headings.map((heading) => (
    <a
      key={heading.id}
      href={`#${heading.id}`}
      className="block py-2 text-sm leading-6 text-stone-600 transition-colors duration-200 hover:text-amber-800"
      style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
    >
      {heading.text}
    </a>
  ));
}

export default function TableOfContents({
  headings,
  variant = "desktop",
}: TableOfContentsProps) {
  if (headings.length === 0) {
    return null;
  }

  if (variant === "mobile") {
    return (
      <details className="rounded-lg border border-stone-200 bg-white/80 px-4 py-3 shadow-sm">
        <summary className="cursor-pointer list-none text-sm font-semibold tracking-[0.16em] text-stone-900">
          文章目录
        </summary>
        <nav className="mt-4 border-t border-stone-200 pt-3">
          {renderHeadingLinks(headings)}
        </nav>
      </details>
    );
  }

  return (
    <aside className="sticky top-28 hidden lg:block">
      <div className="border-l border-stone-200 pl-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
          文章目录
        </p>
        <nav className="mt-4">{renderHeadingLinks(headings)}</nav>
      </div>
    </aside>
  );
}
