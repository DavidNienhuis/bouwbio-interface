/**
 * Audit-Grade PDF Text Highlighting System
 *
 * This module provides robust text highlighting for PDF documents with high hit-rate.
 * It handles:
 * - Unicode normalization (ligatures, special chars like µ, ≤)
 * - Whitespace variations (spaces, newlines, tabs, nbsp)
 * - Timing issues (waits for react-pdf textLayer to be ready)
 * - Fuzzy matching for imperfect citations
 * - Multiple occurrences (chooses best match)
 *
 * Approach:
 * 1. **Timing**: Uses MutationObserver + RAF to ensure textLayer is rendered
 * 2. **Normalization**: Aggressive text cleanup for both citation and PDF text
 * 3. **Matching**: Exact first, then fuzzy fallback with token-based scoring
 * 4. **Highlighting**: Span-based with smooth scroll to match
 */

/**
 * Normalizes text for robust matching
 *
 * Handles:
 * - Case normalization (lowercase)
 * - Unicode normalization (NFKC for ligatures and composed chars)
 * - Whitespace collapse (spaces, tabs, newlines, nbsp → single space)
 * - Special character normalization (µ, ≤, ≥, etc.)
 * - Soft hyphens and zero-width chars removal
 * - Common ligatures (ﬁ, ﬂ, ﬀ, ﬃ, ﬄ)
 */
export function normalizeText(text: string): string {
  return text
    // Unicode normalization - handles composed chars and ligatures
    .normalize('NFKC')
    // Convert to lowercase
    .toLowerCase()
    // Replace common ligatures that might not be in NFKC
    .replace(/ﬁ/g, 'fi')
    .replace(/ﬂ/g, 'fl')
    .replace(/ﬀ/g, 'ff')
    .replace(/ﬃ/g, 'ffi')
    .replace(/ﬄ/g, 'ffl')
    // Normalize special spaces (nbsp, thin space, hair space, etc.)
    .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ')
    // Remove soft hyphens and zero-width chars
    .replace(/[\u00AD\u200B-\u200D\uFEFF]/g, '')
    // Collapse all whitespace (spaces, tabs, newlines) to single space
    .replace(/\s+/g, ' ')
    // Trim edges
    .trim();
}

/**
 * Tokenizes text for fuzzy matching
 */
function tokenize(text: string): string[] {
  return text
    .split(/\s+/)
    .filter(token => token.length > 0);
}

/**
 * Calculates similarity score between two normalized texts using token overlap
 * Returns a score between 0 and 1
 */
function calculateTokenSimilarity(text1: string, text2: string): number {
  const tokens1 = new Set(tokenize(text1));
  const tokens2 = new Set(tokenize(text2));

  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  // Count overlap
  let overlap = 0;
  tokens1.forEach(token => {
    if (tokens2.has(token)) overlap++;
  });

  // Jaccard similarity
  const union = tokens1.size + tokens2.size - overlap;
  return union > 0 ? overlap / union : 0;
}

/**
 * Finds best fuzzy match for citation in text using sliding window
 * Returns { start, end, score } of best match or null if no match above threshold
 */
function findFuzzyMatch(
  normalizedCitation: string,
  normalizedText: string,
  threshold: number = 0.75
): { start: number; end: number; score: number } | null {
  const citationLength = normalizedCitation.length;
  const minLength = Math.floor(citationLength * 0.7);
  const maxLength = Math.ceil(citationLength * 1.3);

  let bestMatch: { start: number; end: number; score: number } | null = null;

  // Try different window sizes around citation length
  for (let windowSize = minLength; windowSize <= maxLength; windowSize += Math.ceil(citationLength * 0.1)) {
    for (let i = 0; i <= normalizedText.length - windowSize; i++) {
      const window = normalizedText.substring(i, i + windowSize);
      const score = calculateTokenSimilarity(normalizedCitation, window);

      if (score > threshold && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { start: i, end: i + windowSize, score };
      }
    }
  }

  return bestMatch;
}

/**
 * Match result from text search
 */
export interface MatchResult {
  /** Start position in normalized text */
  normalizedStart: number;
  /** End position in normalized text */
  normalizedEnd: number;
  /** Match quality: 'exact' or 'fuzzy' */
  matchType: 'exact' | 'fuzzy';
  /** Confidence score (0-1) */
  confidence: number;
}

/**
 * Finds citation in PDF text using exact then fuzzy matching
 *
 * Strategy:
 * 1. Try exact match in normalized text
 * 2. If not found, try fuzzy match (token-based, 75% threshold)
 * 3. Return best match or null
 */
export function findCitationMatch(
  citation: string,
  fullText: string
): MatchResult | null {
  const normalizedCitation = normalizeText(citation);
  const normalizedText = normalizeText(fullText);

  // Safeguard: truncate very long citations (keep first 250 chars of normalized)
  const searchCitation = normalizedCitation.length > 250
    ? normalizedCitation.substring(0, 250)
    : normalizedCitation;

  // 1. Try exact match
  const exactIndex = normalizedText.indexOf(searchCitation);
  if (exactIndex !== -1) {
    return {
      normalizedStart: exactIndex,
      normalizedEnd: exactIndex + searchCitation.length,
      matchType: 'exact',
      confidence: 1.0
    };
  }

  // 2. Try fuzzy match
  const fuzzyMatch = findFuzzyMatch(searchCitation, normalizedText, 0.75);
  if (fuzzyMatch) {
    return {
      normalizedStart: fuzzyMatch.start,
      normalizedEnd: fuzzyMatch.end,
      matchType: 'fuzzy',
      confidence: fuzzyMatch.score
    };
  }

  return null;
}

/**
 * Character mapping between normalized and original text
 * Maps each character in normalized text to its position in original text
 */
function buildCharacterMap(originalText: string): { normalized: string; charMap: number[] } {
  let normalized = '';
  const charMap: number[] = [];

  for (let i = 0; i < originalText.length; i++) {
    const char = originalText[i];
    const normalizedChar = normalizeText(char);

    // Only add to map if character produces output after normalization
    if (normalizedChar.length > 0) {
      // For multi-char normalization results, map each output char to original position
      for (let j = 0; j < normalizedChar.length; j++) {
        charMap.push(i);
        normalized += normalizedChar[j];
      }
    }
  }

  return { normalized, charMap };
}

/**
 * Waits for PDF textLayer to be fully rendered
 *
 * Uses MutationObserver to watch for textContent appearance,
 * combined with retry/backoff to handle timing issues.
 *
 * @param containerElement - Container element that will contain .react-pdf__Page__textContent
 * @param maxAttempts - Maximum number of retry attempts (default: 10)
 * @param attemptInterval - Time between attempts in ms (default: 100)
 * @returns Promise that resolves to textContent element or null if timeout
 */
export function waitForTextLayer(
  containerElement: HTMLElement | null,
  maxAttempts: number = 10,
  attemptInterval: number = 100
): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    if (!containerElement) {
      resolve(null);
      return;
    }

    let attempts = 0;

    // Try immediate check
    const existing = containerElement.querySelector('.react-pdf__Page__textContent') as HTMLElement | null;
    if (existing && existing.children.length > 0) {
      // Use RAF to ensure rendering is complete
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve(existing);
        });
      });
      return;
    }

    // Setup MutationObserver for when textContent appears
    const observer = new MutationObserver(() => {
      const textContent = containerElement.querySelector('.react-pdf__Page__textContent') as HTMLElement | null;
      if (textContent && textContent.children.length > 0) {
        observer.disconnect();
        // Use RAF to ensure layout is settled
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve(textContent);
          });
        });
      }
    });

    observer.observe(containerElement, {
      childList: true,
      subtree: true
    });

    // Fallback retry mechanism
    const retryInterval = setInterval(() => {
      attempts++;

      const textContent = containerElement.querySelector('.react-pdf__Page__textContent') as HTMLElement | null;
      if (textContent && textContent.children.length > 0) {
        clearInterval(retryInterval);
        observer.disconnect();
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve(textContent);
          });
        });
      } else if (attempts >= maxAttempts) {
        clearInterval(retryInterval);
        observer.disconnect();
        resolve(null);
      }
    }, attemptInterval);
  });
}

/**
 * Result of highlight operation
 */
export interface HighlightResult {
  success: boolean;
  highlightedElements: HTMLElement[];
  matchType?: 'exact' | 'fuzzy';
  confidence?: number;
  message?: string;
}

/**
 * Highlights citation text in PDF textLayer
 *
 * Process:
 * 1. Wait for textLayer to be ready
 * 2. Extract and normalize text from spans
 * 3. Find citation match (exact or fuzzy)
 * 4. Map match back to original span positions
 * 5. Apply highlight class to matching spans
 * 6. Scroll to first highlighted span
 *
 * @param containerElement - Container with PDF textLayer
 * @param citation - Citation text to highlight
 * @param highlightClassName - CSS class to apply (default: 'pdf-highlight')
 * @returns Promise with highlight result
 */
export async function highlightCitationInPDF(
  containerElement: HTMLElement | null,
  citation: string | undefined,
  highlightClassName: string = 'pdf-highlight'
): Promise<HighlightResult> {
  if (!citation || !containerElement) {
    return { success: false, highlightedElements: [], message: 'Geen citaat of container' };
  }

  // Remove existing highlights
  const existingHighlights = document.querySelectorAll(`.${highlightClassName}`);
  existingHighlights.forEach(el => el.classList.remove(highlightClassName));

  // Wait for textLayer to be ready
  const textContent = await waitForTextLayer(containerElement, 10, 100);
  if (!textContent) {
    return {
      success: false,
      highlightedElements: [],
      message: 'TextLayer niet beschikbaar'
    };
  }

  // Get all text spans
  const spans = Array.from(textContent.querySelectorAll('span')) as HTMLElement[];
  if (spans.length === 0) {
    return { success: false, highlightedElements: [], message: 'Geen tekst gevonden' };
  }

  // Build full text with character mapping
  let fullOriginalText = '';
  const spanRanges: Array<{ start: number; end: number; element: HTMLElement }> = [];

  spans.forEach(span => {
    const text = span.textContent || '';
    const start = fullOriginalText.length;
    const end = start + text.length;
    spanRanges.push({ start, end, element: span });
    fullOriginalText += text;
  });

  // Find match
  const match = findCitationMatch(citation, fullOriginalText);
  if (!match) {
    return {
      success: false,
      highlightedElements: [],
      message: 'Citaat niet gevonden (zelfs niet met fuzzy match)'
    };
  }

  // Build character map to translate normalized positions back to original
  const { charMap } = buildCharacterMap(fullOriginalText);

  // Map normalized match positions to original text positions
  const originalStart = charMap[match.normalizedStart] ?? 0;
  const originalEnd = charMap[match.normalizedEnd - 1] ?? fullOriginalText.length;

  // Highlight spans that overlap with match range
  const highlightedElements: HTMLElement[] = [];
  let firstHighlighted: HTMLElement | null = null;

  spanRanges.forEach(({ start, end, element }) => {
    // Check overlap: span overlaps if it starts before match ends AND ends after match starts
    if (start < originalEnd && end > originalStart) {
      element.classList.add(highlightClassName);
      highlightedElements.push(element);
      if (!firstHighlighted) {
        firstHighlighted = element;
      }
    }
  });

  // Scroll to first highlighted element
  if (firstHighlighted) {
    // Use RAF for smooth scroll after layout
    requestAnimationFrame(() => {
      firstHighlighted.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    });
  }

  return {
    success: highlightedElements.length > 0,
    highlightedElements,
    matchType: match.matchType,
    confidence: match.confidence,
    message: match.matchType === 'fuzzy'
      ? `Match gevonden (fuzzy, ${Math.round(match.confidence * 100)}% zekerheid)`
      : 'Exacte match gevonden'
  };
}
