import * as XLSX from 'xlsx';

/**
 * Generates and downloads an Excel template for quiz question import
 */
export const generateQuizQuestionTemplate = () => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Define the headers
  const headers = [
    'Question',
    'Option A',
    'Option B',
    'Option C',
    'Option D',
    'Correct Answer',
    'Points',
    'Explanation',
    'Order'
  ];

  // Sample data rows
  const sampleData = [
    [
      'What is the capital of France?',
      'London',
      'Berlin',
      'Paris',
      'Madrid',
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
      'B',
      '1',
      'JavaScript is the primary language for web development.',
      '2'
    ],
    [
      'What is 2 + 2?',
      '3',
      '4',
      '5',
      '6',
      'B',
      '1',
      'Basic arithmetic: 2 + 2 = 4',
      '3'
    ]
  ];

  // Combine headers and sample data
  const worksheetData = [headers, ...sampleData];

  // Create worksheet from array
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths for better readability
  worksheet['!cols'] = [
    { wch: 40 }, // Question
    { wch: 20 }, // Option A
    { wch: 20 }, // Option B
    { wch: 20 }, // Option C
    { wch: 20 }, // Option D
    { wch: 15 }, // Correct Answer
    { wch: 10 }, // Points
    { wch: 40 }, // Explanation
    { wch: 10 }  // Order
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');

  // Generate Excel file and download
  const fileName = 'quiz_questions_template.xlsx';
  XLSX.writeFile(workbook, fileName);
};
