
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
    passages: ['Genesis 1-2', 'Psalm 19'],
    theme: 'Knowing God',
    month: 1,
    monthName: 'June'
  },
  {
    day: 2,
    date: '2025-06-02',
    passages: ['Genesis 3-4', 'Psalm 8'],
    theme: 'Knowing God',
    month: 1,
    monthName: 'June'
  },
  {
    day: 3,
    date: '2025-06-03',
    passages: ['Genesis 5-6', 'Psalm 23'],
    theme: 'Knowing God',
    month: 1,
    monthName: 'June'
  },
  {
    day: 4,
    date: '2025-06-04',
    passages: ['Genesis 7-8', 'Psalm 46'],
    theme: 'Knowing God',
    month: 1,
    monthName: 'June'
  },
  {
    day: 5,
    date: '2025-06-05',
    passages: ['Genesis 9-10', 'Psalm 91'],
    theme: 'Knowing God',
    month: 1,
    monthName: 'June'
  },
  
  // // Continue with more days for June (Month 1)
  // ...Array.from({ length: 25 }, (_, i) => ({
  //   day: i + 6,
  //   date: `2025-06-${String(i + 6).padStart(2, '0')}`,
  //   passages: ['Exodus 3', 'Psalm 8'],
  //   theme: 'Knowing God',
  //   month: 1,
  //   monthName: 'June'
  // })),
  
  // // Month 2: Walking with God (Days 31-60)
  // ...Array.from({ length: 30 }, (_, i) => ({
  //   day: i + 31,
  //   date: `2025-07-${String(i + 1).padStart(2, '0')}`,
  //   passages: ['Romans 8', 'Psalm 23'],
  //   theme: 'Walking with God',
  //   month: 2,
  //   monthName: 'July'
  // })),
  
  // // Month 3: Serving God (Days 61-90)
  // ...Array.from({ length: 30 }, (_, i) => ({
  //   day: i + 61,
  //   date: `2025-08-${String(i + 1).padStart(2, '0')}`,
  //   passages: ['Matthew 28', 'Psalm 100'],
  //   theme: 'Serving God',
  //   month: 3,
  //   monthName: 'August'
  // }))
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
