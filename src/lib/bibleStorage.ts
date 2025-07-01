
import { cache } from '@/lib/cacheUtils';

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

export class BibleStorage {
  private static instance: BibleStorage;
  private books: BibleBook[] = [];
  private initialized = false;

  static getInstance(): BibleStorage {
    if (!BibleStorage.instance) {
      BibleStorage.instance = new BibleStorage();
    }
    return BibleStorage.instance;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Load basic Bible structure
      this.books = await this.loadBibleStructure();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Bible storage:', error);
      throw error;
    }
  }

  private async loadBibleStructure(): Promise<BibleBook[]> {
    return [
      // Old Testament
      { id: 'gen', name: 'Genesis', abbreviation: 'Gen', testament: 'old', chapters: 50, verses: { 1: 31, 2: 25, 3: 24 } },
      { id: 'exo', name: 'Exodus', abbreviation: 'Exo', testament: 'old', chapters: 40, verses: { 1: 22, 2: 25, 3: 22 } },
      { id: 'lev', name: 'Leviticus', abbreviation: 'Lev', testament: 'old', chapters: 27, verses: { 1: 17, 2: 16, 3: 17 } },
      { id: 'num', name: 'Numbers', abbreviation: 'Num', testament: 'old', chapters: 36, verses: { 1: 54, 2: 34, 3: 51 } },
      { id: 'deu', name: 'Deuteronomy', abbreviation: 'Deu', testament: 'old', chapters: 34, verses: { 1: 46, 2: 37, 3: 29 } },
      { id: 'psa', name: 'Psalms', abbreviation: 'Psa', testament: 'old', chapters: 150, verses: { 1: 6, 8: 9, 19: 14, 23: 6, 46: 11, 91: 16 } },
      
      // New Testament
      { id: 'mat', name: 'Matthew', abbreviation: 'Mat', testament: 'new', chapters: 28, verses: { 1: 25, 2: 23, 3: 17 } },
      { id: 'mar', name: 'Mark', abbreviation: 'Mar', testament: 'new', chapters: 16, verses: { 1: 45, 2: 28, 3: 35 } },
      { id: 'luk', name: 'Luke', abbreviation: 'Luk', testament: 'new', chapters: 24, verses: { 1: 80, 2: 52, 3: 38 } },
      { id: 'joh', name: 'John', abbreviation: 'Joh', testament: 'new', chapters: 21, verses: { 1: 51, 2: 25, 3: 36 } },
      { id: 'rom', name: 'Romans', abbreviation: 'Rom', testament: 'new', chapters: 16, verses: { 1: 32, 2: 29, 3: 31, 8: 39 } },
    ];
  }

  async cacheChapter(chapter: BibleChapter): Promise<void> {
    const key = `${chapter.book}-${chapter.chapter}-${chapter.version}`;
    await cache.set('bible-chapters', key, chapter, 86400000); // 24 hours
  }

  async getCachedChapter(book: string, chapter: number, version: string): Promise<BibleChapter | null> {
    const key = `${book}-${chapter}-${version}`;
    return await cache.get('bible-chapters', key);
  }

  async downloadChapter(book: string, chapter: number, version: string): Promise<BibleChapter> {
    try {
      const response = await fetch(`https://bible-api.com/${book}+${chapter}?translation=${version}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${book} ${chapter}`);
      }
      
      const data = await response.json();
      
      const bibleChapter: BibleChapter = {
        book,
        chapter,
        version,
        verses: data.verses?.map((verse: any) => ({
          book,
          chapter,
          verse: verse.verse,
          text: verse.text.trim(),
          version
        })) || []
      };

      await this.cacheChapter(bibleChapter);
      return bibleChapter;
    } catch (error) {
      console.error(`Error downloading ${book} ${chapter}:`, error);
      throw error;
    }
  }

  getBooks(): BibleBook[] {
    return this.books;
  }

  getBook(bookId: string): BibleBook | undefined {
    return this.books.find(book => book.id === bookId || book.name.toLowerCase() === bookId.toLowerCase());
  }

  async getChapter(book: string, chapter: number, version: string): Promise<BibleChapter> {
    // Try cache first
    const cached = await this.getCachedChapter(book, chapter, version);
    if (cached) {
      return cached;
    }

    // Download if not cached
    return await this.downloadChapter(book, chapter, version);
  }
}
