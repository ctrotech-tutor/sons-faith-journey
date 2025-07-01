
export interface Book {
  name: string;
  abbrev: string;
  chapters: string[][];
}

export interface BibleBook {
  id: string;
  name: string;
  abbreviation: string;
  testament: 'old' | 'new';
  chapters: number;
  verses: { [chapter: number]: number };
}

export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  version: string;
}

export interface BibleChapter {
  book: string;
  chapter: number;
  verses: BibleVerse[];
  version: string;
}

export interface BibleVersion {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
  isOffline?: boolean;
}

export interface BibleSearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  version: string;
  relevance: number;
}

export interface BibleBookmark {
  id: string;
  book: string;
  chapter: number;
  verse?: number;
  note?: string;
  createdAt: Date;
  tags: string[];
}

export interface BibleHighlight {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  color: string;
  note?: string;
  createdAt: Date;
}
