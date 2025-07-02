export interface BibleBook {
  name: string;
  shortName: string;
  chapters: number;
  testament: 'Old' | 'New';
  category: string;
}

export const bibleBooks: BibleBook[] = [
  // Old Testament
  { name: 'Genesis', shortName: 'Gen', chapters: 50, testament: 'Old', category: 'Law' },
  { name: 'Exodus', shortName: 'Exo', chapters: 40, testament: 'Old', category: 'Law' },
  { name: 'Leviticus', shortName: 'Lev', chapters: 27, testament: 'Old', category: 'Law' },
  { name: 'Numbers', shortName: 'Num', chapters: 36, testament: 'Old', category: 'Law' },
  { name: 'Deuteronomy', shortName: 'Deu', chapters: 34, testament: 'Old', category: 'Law' },
  { name: 'Joshua', shortName: 'Jos', chapters: 24, testament: 'Old', category: 'History' },
  { name: 'Judges', shortName: 'Jdg', chapters: 21, testament: 'Old', category: 'History' },
  { name: 'Ruth', shortName: 'Rut', chapters: 4, testament: 'Old', category: 'History' },
  { name: '1 Samuel', shortName: '1Sa', chapters: 31, testament: 'Old', category: 'History' },
  { name: '2 Samuel', shortName: '2Sa', chapters: 24, testament: 'Old', category: 'History' },
  { name: '1 Kings', shortName: '1Ki', chapters: 22, testament: 'Old', category: 'History' },
  { name: '2 Kings', shortName: '2Ki', chapters: 25, testament: 'Old', category: 'History' },
  { name: '1 Chronicles', shortName: '1Ch', chapters: 29, testament: 'Old', category: 'History' },
  { name: '2 Chronicles', shortName: '2Ch', chapters: 36, testament: 'Old', category: 'History' },
  { name: 'Ezra', shortName: 'Ezr', chapters: 10, testament: 'Old', category: 'History' },
  { name: 'Nehemiah', shortName: 'Neh', chapters: 13, testament: 'Old', category: 'History' },
  { name: 'Esther', shortName: 'Est', chapters: 10, testament: 'Old', category: 'History' },
  { name: 'Job', shortName: 'Job', chapters: 42, testament: 'Old', category: 'Wisdom' },
  { name: 'Psalms', shortName: 'Psa', chapters: 150, testament: 'Old', category: 'Wisdom' },
  { name: 'Proverbs', shortName: 'Pro', chapters: 31, testament: 'Old', category: 'Wisdom' },
  { name: 'Ecclesiastes', shortName: 'Ecc', chapters: 12, testament: 'Old', category: 'Wisdom' },
  { name: 'Song of Solomon', shortName: 'Son', chapters: 8, testament: 'Old', category: 'Wisdom' },
  { name: 'Isaiah', shortName: 'Isa', chapters: 66, testament: 'Old', category: 'Major Prophets' },
  { name: 'Jeremiah', shortName: 'Jer', chapters: 52, testament: 'Old', category: 'Major Prophets' },
  { name: 'Lamentations', shortName: 'Lam', chapters: 5, testament: 'Old', category: 'Major Prophets' },
  { name: 'Ezekiel', shortName: 'Eze', chapters: 48, testament: 'Old', category: 'Major Prophets' },
  { name: 'Daniel', shortName: 'Dan', chapters: 12, testament: 'Old', category: 'Major Prophets' },
  { name: 'Hosea', shortName: 'Hos', chapters: 14, testament: 'Old', category: 'Minor Prophets' },
  { name: 'Joel', shortName: 'Joe', chapters: 3, testament: 'Old', category: 'Minor Prophets' },
  { name: 'Amos', shortName: 'Amo', chapters: 9, testament: 'Old', category: 'Minor Prophets' },
  { name: 'Obadiah', shortName: 'Oba', chapters: 1, testament: 'Old', category: 'Minor Prophets' },
  { name: 'Jonah', shortName: 'Jon', chapters: 4, testament: 'Old', category: 'Minor Prophets' },
  { name: 'Micah', shortName: 'Mic', chapters: 7, testament: 'Old', category: 'Minor Prophets' },
  { name: 'Nahum', shortName: 'Nah', chapters: 3, testament: 'Old', category: 'Minor Prophets' },
  { name: 'Habakkuk', shortName: 'Hab', chapters: 3, testament: 'Old', category: 'Minor Prophets' },
  { name: 'Zephaniah', shortName: 'Zep', chapters: 3, testament: 'Old', category: 'Minor Prophets' },
  { name: 'Haggai', shortName: 'Hag', chapters: 2, testament: 'Old', category: 'Minor Prophets' },
  { name: 'Zechariah', shortName: 'Zec', chapters: 14, testament: 'Old', category: 'Minor Prophets' },
  { name: 'Malachi', shortName: 'Mal', chapters: 4, testament: 'Old', category: 'Minor Prophets' },

  // New Testament
  { name: 'Matthew', shortName: 'Mat', chapters: 28, testament: 'New', category: 'Gospels' },
  { name: 'Mark', shortName: 'Mar', chapters: 16, testament: 'New', category: 'Gospels' },
  { name: 'Luke', shortName: 'Luk', chapters: 24, testament: 'New', category: 'Gospels' },
  { name: 'John', shortName: 'Joh', chapters: 21, testament: 'New', category: 'Gospels' },
  { name: 'Acts', shortName: 'Act', chapters: 28, testament: 'New', category: 'History' },
  { name: 'Romans', shortName: 'Rom', chapters: 16, testament: 'New', category: 'Epistles' },
  { name: '1 Corinthians', shortName: '1Co', chapters: 16, testament: 'New', category: 'Epistles' },
  { name: '2 Corinthians', shortName: '2Co', chapters: 13, testament: 'New', category: 'Epistles' },
  { name: 'Galatians', shortName: 'Gal', chapters: 6, testament: 'New', category: 'Epistles' },
  { name: 'Ephesians', shortName: 'Eph', chapters: 6, testament: 'New', category: 'Epistles' },
  { name: 'Philippians', shortName: 'Phi', chapters: 4, testament: 'New', category: 'Epistles' },
  { name: 'Colossians', shortName: 'Col', chapters: 4, testament: 'New', category: 'Epistles' },
  { name: '1 Thessalonians', shortName: '1Th', chapters: 5, testament: 'New', category: 'Epistles' },
  { name: '2 Thessalonians', shortName: '2Th', chapters: 3, testament: 'New', category: 'Epistles' },
  { name: '1 Timothy', shortName: '1Ti', chapters: 6, testament: 'New', category: 'Epistles' },
  { name: '2 Timothy', shortName: '2Ti', chapters: 4, testament: 'New', category: 'Epistles' },
  { name: 'Titus', shortName: 'Tit', chapters: 3, testament: 'New', category: 'Epistles' },
  { name: 'Philemon', shortName: 'Phm', chapters: 1, testament: 'New', category: 'Epistles' },
  { name: 'Hebrews', shortName: 'Heb', chapters: 13, testament: 'New', category: 'Epistles' },
  { name: 'James', shortName: 'Jas', chapters: 5, testament: 'New', category: 'Epistles' },
  { name: '1 Peter', shortName: '1Pe', chapters: 5, testament: 'New', category: 'Epistles' },
  { name: '2 Peter', shortName: '2Pe', chapters: 3, testament: 'New', category: 'Epistles' },
  { name: '1 John', shortName: '1Jo', chapters: 5, testament: 'New', category: 'Epistles' },
  { name: '2 John', shortName: '2Jo', chapters: 1, testament: 'New', category: 'Epistles' },
  { name: '3 John', shortName: '3Jo', chapters: 1, testament: 'New', category: 'Epistles' },
  { name: 'Jude', shortName: 'Jud', chapters: 1, testament: 'New', category: 'Epistles' },
  { name: 'Revelation', shortName: 'Rev', chapters: 22, testament: 'New', category: 'Prophecy' },
];

export const bibleVersions = [
  { value: 'kjv', label: 'King James Version (KJV)' },
  { value: 'esv', label: 'English Standard Version (ESV)' },
  { value: 'niv', label: 'New International Version (NIV)' },
  { value: 'nlt', label: 'New Living Translation (NLT)' },
  { value: 'nasb', label: 'New American Standard Bible (NASB)' }
];

export const getBookByName = (name: string): BibleBook | undefined => {
  return bibleBooks.find(book => 
    book.name.toLowerCase() === name.toLowerCase() || 
    book.shortName.toLowerCase() === name.toLowerCase()
  );
};

export const getBooksByTestament = (testament: 'Old' | 'New'): BibleBook[] => {
  return bibleBooks.filter(book => book.testament === testament);
};

export const getBooksByCategory = (category: string): BibleBook[] => {
  return bibleBooks.filter(book => book.category === category);
};