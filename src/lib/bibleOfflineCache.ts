import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface BibleCacheDB extends DBSchema {
  verses: {
    key: string; // Format: "book_chapter_verse"
    value: {
      id: string;
      book: string;
      chapter: number;
      verse: number;
      text: string;
      version: string;
      cachedAt: number;
    };
  };
  chapters: {
    key: string; // Format: "book_chapter_version"
    value: {
      id: string;
      book: string;
      chapter: number;
      version: string;
      verses: any[];
      cachedAt: number;
    };
  };
  books: {
    key: string; // Format: "version"
    value: {
      id: string;
      version: string;
      books: any[];
      cachedAt: number;
    };
  };
  metadata: {
    key: string;
    value: {
      id: string;
      totalVerses: number;
      totalChapters: number;
      totalBooks: number;
      lastUpdated: number;
      isFullyCached: boolean;
      downloadProgress: number;
    };
  };
}

class BibleOfflineCache {
  private db: IDBPDatabase<BibleCacheDB> | null = null;
  private isInitialized = false;
  private downloadProgress = 0;
  private onProgressCallback: ((progress: number) => void) | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.db = await openDB<BibleCacheDB>('BibleCache', 1, {
        upgrade(db) {
          // Create object stores
          if (!db.objectStoreNames.contains('verses')) {
            db.createObjectStore('verses', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('chapters')) {
            db.createObjectStore('chapters', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('books')) {
            db.createObjectStore('books', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('metadata')) {
            db.createObjectStore('metadata', { keyPath: 'id' });
          }
        },
      });

      this.isInitialized = true;
      console.log('Bible offline cache initialized');
    } catch (error) {
      console.error('Failed to initialize Bible cache:', error);
      throw error;
    }
  }

  async isFullyCached(): Promise<boolean> {
    if (!this.db) await this.initialize();
    
    try {
      const metadata = await this.db!.get('metadata', 'cache_status');
      return metadata?.isFullyCached || false;
    } catch (error) {
      console.error('Error checking cache status:', error);
      return false;
    }
  }

  async getDownloadProgress(): Promise<number> {
    if (!this.db) await this.initialize();
    
    try {
      const metadata = await this.db!.get('metadata', 'cache_status');
      return metadata?.downloadProgress || 0;
    } catch (error) {
      console.error('Error getting download progress:', error);
      return 0;
    }
  }

  setProgressCallback(callback: (progress: number) => void): void {
    this.onProgressCallback = callback;
  }

  private updateProgress(progress: number): void {
    this.downloadProgress = progress;
    if (this.onProgressCallback) {
      this.onProgressCallback(progress);
    }
  }

  async downloadAllBibleData(): Promise<void> {
    if (!this.db) await this.initialize();

    const bibleBooks = [
      'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
      'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
      '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
      'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
      'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations',
      'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
      'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
      'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
      'Matthew', 'Mark', 'Luke', 'John', 'Acts',
      'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
      'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy',
      '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
      '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
      'Jude', 'Revelation'
    ];

    const bookChapterCounts: { [key: string]: number } = {
      'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36, 'Deuteronomy': 34,
      'Joshua': 24, 'Judges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24,
      '1 Kings': 22, '2 Kings': 25, '1 Chronicles': 29, '2 Chronicles': 36, 'Ezra': 10,
      'Nehemiah': 13, 'Esther': 10, 'Job': 42, 'Psalms': 150, 'Proverbs': 31,
      'Ecclesiastes': 12, 'Song of Solomon': 8, 'Isaiah': 66, 'Jeremiah': 52, 'Lamentations': 5,
      'Ezekiel': 48, 'Daniel': 12, 'Hosea': 14, 'Joel': 3, 'Amos': 9,
      'Obadiah': 1, 'Jonah': 4, 'Micah': 7, 'Nahum': 3, 'Habakkuk': 3,
      'Zephaniah': 3, 'Haggai': 2, 'Zechariah': 14, 'Malachi': 4,
      'Matthew': 28, 'Mark': 16, 'Luke': 24, 'John': 21, 'Acts': 28,
      'Romans': 16, '1 Corinthians': 16, '2 Corinthians': 13, 'Galatians': 6, 'Ephesians': 6,
      'Philippians': 4, 'Colossians': 4, '1 Thessalonians': 5, '2 Thessalonians': 3, '1 Timothy': 6,
      '2 Timothy': 4, 'Titus': 3, 'Philemon': 1, 'Hebrews': 13, 'James': 5,
      '1 Peter': 5, '2 Peter': 3, '1 John': 5, '2 John': 1, '3 John': 1,
      'Jude': 1, 'Revelation': 22
    };

    const totalChapters = Object.values(bookChapterCounts).reduce((sum, count) => sum + count, 0);
    let processedChapters = 0;
    const version = 'kjv';

    try {
      for (const book of bibleBooks) {
        const chapterCount = bookChapterCounts[book];
        
        for (let chapter = 1; chapter <= chapterCount; chapter++) {
          try {
            // Small delay to prevent overwhelming the API
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const response = await fetch(`https://bible-api.com/${book}+${chapter}?translation=${version}`);
            
            if (response.ok) {
              const data = await response.json();
              
              if (data.verses && data.verses.length > 0) {
                // Cache the chapter
                const chapterData = {
                  id: `${book}_${chapter}_${version}`,
                  book,
                  chapter,
                  version,
                  verses: data.verses,
                  cachedAt: Date.now()
                };

                await this.db!.put('chapters', chapterData);

                // Cache individual verses
                for (const verse of data.verses) {
                  const verseData = {
                    id: `${book}_${chapter}_${verse.verse}`,
                    book,
                    chapter,
                    verse: verse.verse,
                    text: verse.text,
                    version,
                    cachedAt: Date.now()
                  };

                  await this.db!.put('verses', verseData);
                }
              }
            }
          } catch (error) {
            console.warn(`Failed to cache ${book} ${chapter}:`, error);
          }

          processedChapters++;
          const progress = Math.round((processedChapters / totalChapters) * 100);
          this.updateProgress(progress);
        }
      }

      // Update metadata
      await this.db!.put('metadata', {
        id: 'cache_status',
        totalVerses: await this.db!.count('verses'),
        totalChapters: await this.db!.count('chapters'),
        totalBooks: bibleBooks.length,
        lastUpdated: Date.now(),
        isFullyCached: true,
        downloadProgress: 100
      });

      console.log('Bible data fully cached offline');
    } catch (error) {
      console.error('Error downloading Bible data:', error);
      throw error;
    }
  }

  async getChapter(book: string, chapter: number, version: string = 'kjv'): Promise<any> {
    if (!this.db) await this.initialize();

    try {
      const chapterData = await this.db!.get('chapters', `${book}_${chapter}_${version}`);
      
      if (chapterData) {
        return {
          verses: chapterData.verses.map(verse => ({
            chapter: chapterData.chapter,
            verse: verse.verse,
            text: verse.text
          }))
        };
      }

      // If not cached, try to fetch from API
      try {
        const response = await fetch(`https://bible-api.com/${book}+${chapter}?translation=${version}`);
        
        if (response.ok) {
          const data = await response.json();
          
          // Cache for future use
          const chapterCacheData = {
            id: `${book}_${chapter}_${version}`,
            book,
            chapter,
            version,
            verses: data.verses,
            cachedAt: Date.now()
          };

          await this.db!.put('chapters', chapterCacheData);

          return data;
        }
      } catch (fetchError) {
        console.error('Failed to fetch chapter from API:', fetchError);
      }

      return null;
    } catch (error) {
      console.error('Error getting chapter:', error);
      return null;
    }
  }

  async getVerse(book: string, chapter: number, verse: number, version: string = 'kjv'): Promise<any> {
    if (!this.db) await this.initialize();

    try {
      const verseData = await this.db!.get('verses', `${book}_${chapter}_${verse}`);
      
      if (verseData) {
        return verseData;
      }

      // If not cached, get from chapter cache or API
      const chapterData = await this.getChapter(book, chapter, version);
      
      if (chapterData && chapterData.verses) {
        const foundVerse = chapterData.verses.find((v: any) => v.verse === verse);
        return foundVerse || null;
      }

      return null;
    } catch (error) {
      console.error('Error getting verse:', error);
      return null;
    }
  }

  async clearCache(): Promise<void> {
    if (!this.db) await this.initialize();

    try {
      await this.db!.clear('verses');
      await this.db!.clear('chapters');
      await this.db!.clear('books');
      await this.db!.clear('metadata');
      
      console.log('Bible cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  }

  async getCacheSize(): Promise<number> {
    if (!this.db) await this.initialize();

    try {
      const verseCount = await this.db!.count('verses');
      const chapterCount = await this.db!.count('chapters');
      
      // Rough estimate: each verse ~100 bytes, each chapter ~2KB
      return (verseCount * 100) + (chapterCount * 2000);
    } catch (error) {
      console.error('Error getting cache size:', error);
      return 0;
    }
  }
}

export const bibleOfflineCache = new BibleOfflineCache();