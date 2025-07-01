
import { cache } from '@/lib/cacheUtils';

export interface BibleBook {
  id: string;
  name: string;
  abbreviation: string;
  testament: 'old' | 'new';
  chapters: number;
  verses: { [chapter: number]: number };
  aliases?: string[]; // Alternative names for the book
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
      console.log('Initializing Bible storage...');
      this.books = await this.loadBibleStructure();
      this.initialized = true;
      console.log('Bible storage initialized with', this.books.length, 'books');
    } catch (error) {
      console.error('Failed to initialize Bible storage:', error);
      throw error;
    }
  }

  private async loadBibleStructure(): Promise<BibleBook[]> {
    return [
      // Old Testament
      { 
        id: 'gen', 
        name: 'Genesis', 
        abbreviation: 'Gen', 
        testament: 'old', 
        chapters: 50, 
        verses: { 1: 31, 2: 25, 3: 24 },
        aliases: ['Genesis', 'Gen']
      },
      { 
        id: 'exo', 
        name: 'Exodus', 
        abbreviation: 'Exo', 
        testament: 'old', 
        chapters: 40, 
        verses: { 1: 22, 2: 25, 3: 22 },
        aliases: ['Exodus', 'Exo', 'Ex']
      },
      { 
        id: 'lev', 
        name: 'Leviticus', 
        abbreviation: 'Lev', 
        testament: 'old', 
        chapters: 27, 
        verses: { 1: 17, 2: 16, 3: 17 },
        aliases: ['Leviticus', 'Lev']
      },
      { 
        id: 'num', 
        name: 'Numbers', 
        abbreviation: 'Num', 
        testament: 'old', 
        chapters: 36, 
        verses: { 1: 54, 2: 34, 3: 51 },
        aliases: ['Numbers', 'Num']
      },
      { 
        id: 'deu', 
        name: 'Deuteronomy', 
        abbreviation: 'Deu', 
        testament: 'old', 
        chapters: 34, 
        verses: { 1: 46, 2: 37, 3: 29 },
        aliases: ['Deuteronomy', 'Deut', 'Deu']
      },
      { 
        id: 'psa', 
        name: 'Psalms', 
        abbreviation: 'Psa', 
        testament: 'old', 
        chapters: 150, 
        verses: { 1: 6, 8: 9, 19: 14, 23: 6, 46: 11, 91: 16 },
        aliases: ['Psalms', 'Psalm', 'Psa', 'Ps']
      },
      
      // New Testament
      { 
        id: 'mat', 
        name: 'Matthew', 
        abbreviation: 'Mat', 
        testament: 'new', 
        chapters: 28, 
        verses: { 1: 25, 2: 23, 3: 17 },
        aliases: ['Matthew', 'Matt', 'Mt']
      },
      { 
        id: 'mar', 
        name: 'Mark', 
        abbreviation: 'Mar', 
        testament: 'new', 
        chapters: 16, 
        verses: { 1: 45, 2: 28, 3: 35 },
        aliases: ['Mark', 'Mar', 'Mk']
      },
      { 
        id: 'luk', 
        name: 'Luke', 
        abbreviation: 'Luk', 
        testament: 'new', 
        chapters: 24, 
        verses: { 1: 80, 2: 52, 3: 38 },
        aliases: ['Luke', 'Luk', 'Lk']
      },
      { 
        id: 'joh', 
        name: 'John', 
        abbreviation: 'Joh', 
        testament: 'new', 
        chapters: 21, 
        verses: { 1: 51, 2: 25, 3: 36 },
        aliases: ['John', 'Joh', 'Jn']
      },
      { 
        id: 'rom', 
        name: 'Romans', 
        abbreviation: 'Rom', 
        testament: 'new', 
        chapters: 16, 
        verses: { 1: 32, 2: 29, 3: 31, 8: 39 },
        aliases: ['Romans', 'Rom', 'Ro']
      },
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
      console.log('Downloading chapter:', { book, chapter, version });
      
      // Try different API endpoints and formats
      const endpoints = [
        `https://bible-api.com/${book}+${chapter}?translation=${version}`,
        `https://bible-api.com/${book}${chapter}?translation=${version}`,
        `https://bible-api.com/${encodeURIComponent(book)}+${chapter}?translation=${version}`
      ];
      
      let lastError: Error | null = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log('Trying endpoint:', endpoint);
          const response = await fetch(endpoint);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log('API Response:', data);
          
          if (!data.verses || data.verses.length === 0) {
            throw new Error('No verses found in response');
          }
          
          const bibleChapter: BibleChapter = {
            book,
            chapter,
            version,
            verses: data.verses.map((verse: any) => ({
              book,
              chapter,
              verse: verse.verse,
              text: verse.text.trim(),
              version
            }))
          };

          await this.cacheChapter(bibleChapter);
          console.log('Chapter downloaded and cached successfully');
          return bibleChapter;
        } catch (error) {
          console.warn(`Endpoint ${endpoint} failed:`, error);
          lastError = error as Error;
          continue;
        }
      }
      
      throw lastError || new Error('All endpoints failed');
    } catch (error) {
      console.error(`Error downloading ${book} ${chapter}:`, error);
      throw new Error(`Failed to download ${book} ${chapter}. Please check your internet connection and try again.`);
    }
  }

  getBooks(): BibleBook[] {
    return this.books;
  }

  getBook(bookId: string): BibleBook | undefined {
    const searchTerm = bookId.toLowerCase().trim();
    
    return this.books.find(book => 
      book.id === searchTerm || 
      book.name.toLowerCase() === searchTerm ||
      book.abbreviation.toLowerCase() === searchTerm ||
      (book.aliases && book.aliases.some(alias => alias.toLowerCase() === searchTerm))
    );
  }

  async getChapter(book: string, chapter: number, version: string): Promise<BibleChapter> {
    console.log('Getting chapter:', { book, chapter, version });
    
    // Find the book first to validate
    const bookData = this.getBook(book);
    if (!bookData) {
      throw new Error(`Book "${book}" not found. Please check the spelling.`);
    }
    
    // Validate chapter number
    if (chapter < 1 || chapter > bookData.chapters) {
      throw new Error(`Chapter ${chapter} does not exist in ${bookData.name}. ${bookData.name} has ${bookData.chapters} chapters.`);
    }
    
    // Use the standardized book name for API calls
    const standardBookName = bookData.name;
    
    // Try cache first
    const cached = await this.getCachedChapter(standardBookName, chapter, version);
    if (cached) {
      console.log('Found cached chapter');
      return cached;
    }

    // Download if not cached
    console.log('Chapter not cached, downloading...');
    return await this.downloadChapter(standardBookName, chapter, version);
  }
}
