
// Bible book name mapping to JSON keys
export const bookKeyMap: { [key: string]: string } = {
  // Old Testament
  "Genesis": "ge",
  "Exodus": "ex", 
  "Leviticus": "le",
  "Numbers": "nu",
  "Deuteronomy": "de",
  "Joshua": "jos",
  "Judges": "jg",
  "Ruth": "ru",
  "1 Samuel": "1sa",
  "2 Samuel": "2sa", 
  "1 Kings": "1ki",
  "2 Kings": "2ki",
  "1 Chronicles": "1ch",
  "2 Chronicles": "2ch",
  "Ezra": "ezr",
  "Nehemiah": "ne",
  "Esther": "es",
  "Job": "job",
  "Psalms": "ps",
  "Psalm": "ps",
  "Proverbs": "pr",
  "Ecclesiastes": "ec",
  "Song of Songs": "so",
  "Song of Solomon": "so",
  "Isaiah": "isa",
  "Jeremiah": "jer",
  "Lamentations": "la",
  "Ezekiel": "eze",
  "Daniel": "da",
  "Hosea": "ho",
  "Joel": "joe",
  "Amos": "am",
  "Obadiah": "ob",
  "Jonah": "jon",
  "Micah": "mic",
  "Nahum": "na",
  "Habakkuk": "hab",
  "Zephaniah": "zep",
  "Haggai": "hag",
  "Zechariah": "zec",
  "Malachi": "mal",
  
  // New Testament
  "Matthew": "mt",
  "Mark": "mr",
  "Luke": "lu",
  "John": "joh",
  "Acts": "ac",
  "Romans": "ro",
  "1 Corinthians": "1co",
  "2 Corinthians": "2co",
  "Galatians": "ga",
  "Ephesians": "eph",
  "Philippians": "php",
  "Colossians": "col",
  "1 Thessalonians": "1th",
  "2 Thessalonians": "2th",
  "1 Timothy": "1ti",
  "2 Timothy": "2ti",
  "Titus": "tit",
  "Philemon": "phm",
  "Hebrews": "heb",
  "James": "jas",
  "1 Peter": "1pe",
  "2 Peter": "2pe",
  "1 John": "1jo",
  "2 John": "2jo",
  "3 John": "3jo",
  "Jude": "jude",
  "Revelation": "re"
};

export const parsePassage = (passage: string) => {
  // Parse passages like "Genesis 1", "Psalm 23", "1 John 3", etc.
  const parts = passage.trim().split(' ');
  
  let bookName = '';
  let chapterRange = '';
  
  // Handle books that start with numbers (1 Samuel, 2 Kings, etc.)
  if (parts[0].match(/^\d/)) {
    bookName = parts[0] + ' ' + parts[1];
    chapterRange = parts[2] || '1';
  } else {
    bookName = parts[0];
    chapterRange = parts[1] || '1';
  }
  
  // Get the book key from our mapping
  const bookKey = bookKeyMap[bookName];
  
  // Parse chapter number (handle ranges like "1-2" by taking the first chapter)
  const chapterNumber = parseInt(chapterRange.split('-')[0]);
  
  return {
    bookName,
    bookKey,
    chapterNumber,
    originalPassage: passage
  };
};

export const formatVerseText = (text: string) => {
  // Clean up verse text by removing extra whitespace and formatting
  return text.trim().replace(/\s+/g, ' ');
};
