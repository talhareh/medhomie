import * as XLSX from 'xlsx';

/**
 * Generates and downloads an Excel template for quiz question import
 */
export const generateQuizQuestionTemplate = () => {
  const workbook = XLSX.utils.book_new();

  const headers = [
    'Question',
    'Option A',
    'Option B',
    'Option C',
    'Option D',
    'Option E',
    'Correct Answer',
    'Points',
    'Explanation',
    'Order'
  ];

  const sampleData = [
    [
      'What is the capital of France?',
      'London',
      'Berlin',
      'Paris',
      'Madrid',
      '',
      'C',
      '1',
      'Paris is the capital and largest city of France.',
      '1'
    ],
    [
      'Which programming language is used for web development?',
      'Python',
      'JavaScript',
      'Java',
      'C++',
      '',
      'B',
      '1',
      'JavaScript is the primary language for web development.',
      '2'
    ],
    [
      'Select all primary colors (example with 5 options)',
      'Red',
      'Green',
      'Blue',
      'Yellow',
      'Orange',
      'E',
      '1',
      'Red, blue, and yellow are primary colors.',
      '3'
    ]
  ];

  const worksheetData = [headers, ...sampleData];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  worksheet['!cols'] = [
    { wch: 45 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
    { wch: 10 },
    { wch: 40 },
    { wch: 10 }
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');

  const fileName = 'quiz_questions_template.xlsx';
  XLSX.writeFile(workbook, fileName);
};
