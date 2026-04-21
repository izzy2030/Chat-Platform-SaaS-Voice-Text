type EffectiveValueOptions<T> = {
  manual?: T | null;
  extracted?: T | null;
};

type KnowledgeBasePageLike = {
  included: boolean;
  crawlStatus: "indexed" | "excluded" | "error";
};

export function coerceWebsiteUrl(value: string) {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
}

export function buildKnowledgeBaseStats(pages: KnowledgeBasePageLike[]) {
  return {
    pagesIndexed: pages.filter((page) => page.included && page.crawlStatus === "indexed").length,
    urlsDiscovered: pages.length,
    includedPages: pages.filter((page) => page.included).length,
  };
}

export function getEffectiveValue<T>({ manual, extracted }: EffectiveValueOptions<T>) {
  if (manual !== undefined && manual !== null && manual !== "") {
    return manual;
  }

  return extracted ?? null;
}
