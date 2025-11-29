import { Question } from '@/types/question';

export const mockQuestions: Question[] = [
  {
    id: '1',
    text: 'What is your favorite programming language and why?',
  },
  {
    id: '2',
    text: 'Describe a challenging project you worked on recently.',
  },
  {
    id: '3',
    text: 'How do you stay updated with the latest technology trends?',
  },
];

export const getMockResults = (questionIds: string[]) => {
  const grades: Array<'A' | 'B' | 'C' | 'D' | 'F'> = ['A', 'B', 'A', 'B', 'C'];
  const feedbacks = [
    'Excellent response! You demonstrated clear understanding and provided specific examples.',
    'Good answer. Consider providing more concrete examples to strengthen your response.',
    'Great job! Your explanation was thorough and well-structured.',
  ];

  return questionIds.map((id, index) => {
    const question = mockQuestions.find(q => q.id === id);
    const grade = grades[index % grades.length];
    const scoreMap = { A: 95, B: 85, C: 75, D: 65, F: 50 };

    return {
      questionId: id,
      question: question?.text || '',
      grade,
      score: scoreMap[grade],
      feedback: feedbacks[index % feedbacks.length],
    };
  });
};

