export function normalizeKeywordToken(raw: string): string | null {
    const lowered = raw.trim().toLowerCase();
    if (!lowered) return null;

    let cleaned = '';
    let prevSep = false;

    for (const ch of lowered) {
        if ((ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9')) {
            cleaned += ch;
            prevSep = false;
        } else if (!prevSep && cleaned.length > 0) {
            cleaned += ' ';
            prevSep = true;
        }
    }

    const normalized = cleaned.trim();
    if (!normalized) return null;

    const words = normalized.split(/\s+/).filter(Boolean);
    if (words.length === 0 || words.length > 2) return null;

    return words.join('-');
}

export function normalizeKeywords(input?: string[] | null): string[] {
    if (!input || input.length === 0) return [];

    const deduped = new Set<string>();
    for (const raw of input) {
        for (const token of raw.split(/[\n\r\t,;|]/g)) {
            const normalized = normalizeKeywordToken(token);
            if (normalized) deduped.add(normalized);
        }
    }

    return Array.from(deduped).sort((a, b) => a.localeCompare(b));
}

export function keywordsDiffer(a?: string[] | null, b?: string[] | null): boolean {
    const na = normalizeKeywords(a);
    const nb = normalizeKeywords(b);

    if (na.length !== nb.length) return true;
    return na.some((value, index) => value !== nb[index]);
}
