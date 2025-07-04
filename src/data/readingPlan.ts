
export interface ReadingDay {
  day: number;
  date: string;
  passages: string[];
  theme: string;
  month: number;
  monthName: string;
}

export const readingPlan: ReadingDay[] = [
  // Days 1-30: Who God Is
  { day: 1, date: '2025-06-01', passages: ['Genesis 1-2', 'Psalm 19'], theme: 'Who God Is', month: 1, monthName: 'June' },
  { day: 2, date: '2025-06-02', passages: ['Exodus 3', 'Psalm 8'], theme: 'Who God Is', month: 1, monthName: 'June' },
  { day: 3, date: '2025-06-03', passages: ['Exodus 33-34', 'John 1:1-18'], theme: 'Who God Is', month: 1, monthName: 'June' },
  { day: 4, date: '2025-06-04', passages: ['Isaiah 6', 'Revelation 4'], theme: 'Who God Is', month: 1, monthName: 'June' },
  { day: 5, date: '2025-06-05', passages: ['Psalm 90', 'Job 38'], theme: 'Who God Is', month: 1, monthName: 'June' },
  { day: 6, date: '2025-06-06', passages: ['Psalm 139', 'Proverbs 9'], theme: 'Who God Is', month: 1, monthName: 'June' },
  { day: 7, date: '2025-06-07', passages: ['Jeremiah 9:23-24', 'Colossians 1:15-20'], theme: 'Who God Is', month: 1, monthName: 'June' },
  { day: 8, date: '2025-06-08', passages: ['Deuteronomy 6', 'Mark 12:28-34'], theme: 'Who God Is', month: 1, monthName: 'June' },
  { day: 9, date: '2025-06-09', passages: ['Isaiah 40', 'Psalm 103'], theme: 'Who God Is', month: 1, monthName: 'June' },
  { day: 10, date: '2025-06-10', passages: ['Psalm 145', 'Romans 1:18-25'], theme: 'Who God Is', month: 1, monthName: 'June' },
  { day: 11, date: '2025-06-11', passages: ['Proverbs 2', 'James 1'], theme: 'Who God Is', month: 1, monthName: 'June' },
  { day: 12, date: '2025-06-12', passages: ['Psalm 46', 'Hebrews 1:1-4'], theme: 'Who God Is', month: 1, monthName: 'June' },
  { day: 13, date: '2025-06-13', passages: ['Isaiah 55', '1 John 1'], theme: 'Who God Is', month: 1, monthName: 'June' },
  { day: 14, date: '2025-06-14', passages: ['Exodus 20', 'Matthew 5:17-20'], theme: 'Who God Is', month: 1, monthName: 'June' },
  { day: 15, date: '2025-06-15', passages: ['1 Kings 8:22-61'], theme: 'Who God Is', month: 1, monthName: 'June' },
  { day: 16, date: '2025-06-16', passages: ['Psalm 33', 'Romans 11:33-36'], theme: 'Who God Is', month: 1, monthName: 'June' },
  { day: 17, date: '2025-06-17', passages: ['Job 42', 'Habakkuk 3'], theme: 'Who God Is', month: 1, monthName: 'June' },
  { day: 18, date: '2025-06-18', passages: ['Deuteronomy 10:12-22', 'Micah 6:6-8'], theme: 'Who God Is', month: 1, monthName: 'June' },
  { day: 19, date: '2025-06-19', passages: ['Isaiah 43', 'Hebrews 12:18-29'], theme: 'Who God Is', month: 1, monthName: 'June' },
  { day: 20, date: '2025-06-20', passages: ['Psalm 111-112'], theme: 'Who God Is', month: 1, monthName: 'June' },
  { day: 21, date: '2025-06-21', passages: ['Psalm 29', 'Revelation 1'], theme: 'Who God Is', month: 1, monthName: 'June' },
  { day: 22, date: '2025-06-22', passages: ['Nehemiah 9:5-38'], theme: 'Who God Is', month: 1, monthName: 'June' },
  { day: 23, date: '2025-06-23', passages: ['2 Samuel 7', 'Psalm 132'], theme: 'Who God Is', month: 1, monthName: 'June' },
  { day: 24, date: '2025-06-24', passages: ['Daniel 4', 'Proverbs 3'], theme: 'Who God Is', month: 1, monthName: 'June' },
  { day: 25, date: '2025-06-25', passages: ['Psalm 96-97'], theme: 'Who God Is', month: 1, monthName: 'June' },
  { day: 26, date: '2025-06-26', passages: ['Ezekiel 36:22-38', 'Titus 3:3-7'], theme: 'Who God Is', month: 1, monthName: 'June' },
  { day: 27, date: '2025-06-27', passages: ['Psalm 115', 'John 4:19-26'], theme: 'Who God Is', month: 1, monthName: 'June' },
  { day: 28, date: '2025-06-28', passages: ['Isaiah 44', 'Psalm 86'], theme: 'Who God Is', month: 1, monthName: 'June' },
  { day: 29, date: '2025-06-29', passages: ['Genesis 15', 'Hebrews 6:13-20'], theme: 'Who God Is', month: 1, monthName: 'June' },
  { day: 30, date: '2025-06-30', passages: ['Psalms 104', 'Acts 17:22-31'], theme: 'Who God Is', month: 1, monthName: 'June' },

  // Days 31-60: God in Relationship
  { day: 31, date: '2025-07-01', passages: ['Genesis 3', 'Romans 5:12-21'], theme: 'God in Relationship', month: 2, monthName: 'July' },
  { day: 32, date: '2025-07-02', passages: ['Genesis 6-9', '2 Peter 3'], theme: 'God in Relationship', month: 2, monthName: 'July' },
  { day: 33, date: '2025-07-03', passages: ['Genesis 22', 'Hebrews 11:17-19'], theme: 'God in Relationship', month: 2, monthName: 'July' },
  { day: 34, date: '2025-07-04', passages: ['Exodus 14-15', 'Psalm 106'], theme: 'God in Relationship', month: 2, monthName: 'July' },
  { day: 35, date: '2025-07-05', passages: ['Exodus 24', 'Hebrews 8'], theme: 'God in Relationship', month: 2, monthName: 'July' },
  { day: 36, date: '2025-07-06', passages: ['Leviticus 16', 'Hebrews 9'], theme: 'God in Relationship', month: 2, monthName: 'July' },
  { day: 37, date: '2025-07-07', passages: ['Numbers 14', 'Psalm 95'], theme: 'God in Relationship', month: 2, monthName: 'July' },
  { day: 38, date: '2025-07-08', passages: ['Deuteronomy 7-8'], theme: 'God in Relationship', month: 2, monthName: 'July' },
  { day: 39, date: '2025-07-09', passages: ['Joshua 1', 'Psalm 121'], theme: 'God in Relationship', month: 2, monthName: 'July' },
  { day: 40, date: '2025-07-10', passages: ['Judges 2', 'Psalm 78:1-39'], theme: 'God in Relationship', month: 2, monthName: 'July' },
  { day: 41, date: '2025-07-11', passages: ['1 Samuel 3', 'Psalm 19'], theme: 'God in Relationship', month: 2, monthName: 'July' },
  { day: 42, date: '2025-07-12', passages: ['2 Samuel 12', 'Psalm 51'], theme: 'God in Relationship', month: 2, monthName: 'July' },
  { day: 43, date: '2025-07-13', passages: ['1 Kings 18', 'Psalm 18'], theme: 'God in Relationship', month: 2, monthName: 'July' },
  { day: 44, date: '2025-07-14', passages: ['2 Chronicles 7:11-22', 'James 4:1-10'], theme: 'God in Relationship', month: 2, monthName: 'July' },
  { day: 45, date: '2025-07-15', passages: ['Nehemiah 1-2', 'Psalm 130'], theme: 'God in Relationship', month: 2, monthName: 'July' },
  { day: 46, date: '2025-07-16', passages: ['Isaiah 1', 'Matthew 23'], theme: 'God in Relationship', month: 2, monthName: 'July' },
  { day: 47, date: '2025-07-17', passages: ['Hosea 2', 'John 3:16-21'], theme: 'God in Relationship', month: 2, monthName: 'July' },
  { day: 48, date: '2025-07-18', passages: ['Hosea 11', 'Romans 11'], theme: 'God in Relationship', month: 2, monthName: 'July' },
  { day: 49, date: '2025-07-19', passages: ['Joel 2:12-32', 'Acts 2'], theme: 'God in Relationship', month: 2, monthName: 'July' },
  { day: 50, date: '2025-07-20', passages: ['Jonah 3-4', 'Luke 15'], theme: 'God in Relationship', month: 2, monthName: 'July' },
  { day: 51, date: '2025-07-21', passages: ['Zephaniah 3:9-20', '2 Corinthians 5'], theme: 'God in Relationship', month: 2, monthName: 'July' },
  { day: 52, date: '2025-07-22', passages: ['Malachi 3-4', 'Revelation 21'], theme: 'God in Relationship', month: 2, monthName: 'July' },
  { day: 53, date: '2025-07-23', passages: ['Psalm 23', 'John 10'], theme: 'God in Relationship', month: 2, monthName: 'July' },
  { day: 54, date: '2025-07-24', passages: ['Psalm 91', 'Romans 8'], theme: 'God in Relationship', month: 2, monthName: 'July' },
  { day: 55, date: '2025-07-25', passages: ['Psalm 34', 'Philippians 4'], theme: 'God in Relationship', month: 2, monthName: 'July' },
  { day: 56, date: '2025-07-26', passages: ['Psalm 1', 'John 15'], theme: 'God in Relationship', month: 2, monthName: 'July' },
  { day: 57, date: '2025-07-27', passages: ['Isaiah 53', '1 Peter 2:21-25'], theme: 'God in Relationship', month: 2, monthName: 'July' },
  { day: 58, date: '2025-07-28', passages: ['Psalm 73', '2 Corinthians 4'], theme: 'God in Relationship', month: 2, monthName: 'July' },
  { day: 59, date: '2025-07-29', passages: ['Lamentations 3:19-26', 'Hebrews 10:19-25'], theme: 'God in Relationship', month: 2, monthName: 'July' },
  { day: 60, date: '2025-07-30', passages: ['Psalm 62', 'Ephesians 3:14-21'], theme: 'God in Relationship', month: 2, monthName: 'July' },

  // Days 61-90: To be added later
];

export const getMonthData = (month: number) => {
  return readingPlan.filter(day => day.month === month);
};

export const getThemeForMonth = (month: number) => {
  const themes = {
    1: 'Who God Is',
    2: 'God in Relationship', 
    3: 'Knowing God' // Days 61-90 to be added
  };
  return themes[month as keyof typeof themes] || 'Knowing God';
};
