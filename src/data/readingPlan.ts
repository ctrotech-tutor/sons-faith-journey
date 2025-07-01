
export interface ReadingDay {
  day: number;
  date: string;
  passages: string[];
  theme: string;
  month: number;
  monthName: string;
}

export const readingPlan: ReadingDay[] = [
  // Month 1: Knowing God (Days 1-30)
  {
    day: 1,
    date: '2025-06-01',
    passages: ['Genesis 1'],
    theme: 'Creation and God\'s Power',
    month: 1,
    monthName: 'June'
  },
  {
    day: 2,
    date: '2025-06-02',
    passages: ['Genesis 2'],
    theme: 'God\'s Design for Humanity',
    month: 1,
    monthName: 'June'
  },
  {
    day: 3,
    date: '2025-06-03',
    passages: ['Genesis 3'],
    theme: 'The Fall and God\'s Promise',
    month: 1,
    monthName: 'June'
  },
  {
    day: 4,
    date: '2025-06-04',
    passages: ['Genesis 6'],
    theme: 'God\'s Judgment and Mercy',
    month: 1,
    monthName: 'June'
  },
  {
    day: 5,
    date: '2025-06-05',
    passages: ['Psalms 1'],
    theme: 'The Blessed Life',
    month: 1,
    monthName: 'June'
  },
  {
    day: 6,
    date: '2025-06-06',
    passages: ['Psalms 23'],
    theme: 'The Lord is My Shepherd',
    month: 1,
    monthName: 'June'
  },
  {
    day: 7,
    date: '2025-06-07',
    passages: ['Matthew 1'],
    theme: 'The Birth of Jesus',
    month: 1,
    monthName: 'June'
  },
  {
    day: 8,
    date: '2025-06-08',
    passages: ['John 1'],
    theme: 'The Word Became Flesh',
    month: 1,
    monthName: 'June'
  },
  {
    day: 9,
    date: '2025-06-09',
    passages: ['Romans 1'],
    theme: 'The Power of the Gospel',
    month: 1,
    monthName: 'June'
  },
  {
    day: 10,
    date: '2025-06-10',
    passages: ['Romans 8'],
    theme: 'Life in the Spirit',
    month: 1,
    monthName: 'June'
  },
  
  // Add more days with proper single-chapter format
  ...Array.from({ length: 20 }, (_, i) => ({
    day: i + 11,
    date: `2025-06-${String(i + 11).padStart(2, '0')}`,
    passages: [`Psalms ${(i % 30) + 1}`],
    theme: 'Knowing God Through Prayer',
    month: 1,
    monthName: 'June'
  })),
  
  // Month 2: Walking with God (Days 31-60)
  ...Array.from({ length: 30 }, (_, i) => ({
    day: i + 31,
    date: `2025-07-${String(i + 1).padStart(2, '0')}`,
    passages: [`Matthew ${(i % 28) + 1}`],
    theme: 'Walking with Jesus',
    month: 2,
    monthName: 'July'
  })),
  
  // Month 3: Serving God (Days 61-90)
  ...Array.from({ length: 30 }, (_, i) => ({
    day: i + 61,
    date: `2025-08-${String(i + 1).padStart(2, '0')}`,
    passages: [`Romans ${(i % 16) + 1}`],
    theme: 'Living for God',
    month: 3,
    monthName: 'August'
  }))
];

export const getMonthData = (month: number) => {
  return readingPlan.filter(day => day.month === month);
};

export const getThemeForMonth = (month: number) => {
  const themes = {
    1: 'Knowing God',
    2: 'Walking with God', 
    3: 'Serving God'
  };
  return themes[month as keyof typeof themes] || 'Bible Reading';
};
