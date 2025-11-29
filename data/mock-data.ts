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
  // Specific grades and scores for each question
  const resultData = [
    {
      grade: 'B' as const,
      score: 73,
      feedback: 'Good answer! You provided relevant points, but could have elaborated more on specific examples. Your reasoning was clear, though adding more depth would strengthen your response. Consider providing concrete scenarios to illustrate your points better.',
    },
    {
      grade: 'A' as const,
      score: 80,
      feedback: 'Excellent response! You demonstrated strong understanding and communicated your ideas effectively. Your answer was well-structured and showed clear thought process. The examples you provided were relevant and helped illustrate your main points perfectly.',
    },
    {
      grade: 'B' as const,
      score: 65,
      feedback: 'Solid answer with good foundational knowledge. You covered the main points adequately, but there\'s room for improvement in terms of detail and specificity. Try to provide more concrete examples and explain your reasoning more thoroughly next time.',
    },
  ];

  return questionIds.map((id, index) => {
    const question = mockQuestions.find(q => q.id === id);
    const data = resultData[index % resultData.length];

    return {
      questionId: id,
      question: question?.text || '',
      grade: data.grade,
      score: data.score,
      feedback: data.feedback,
    };
  });
};

