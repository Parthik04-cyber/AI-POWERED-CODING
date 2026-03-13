'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';

const QuizRedirectPage = () => {
  const router = useRouter();
  const quizId = typeof router.query.quizId === 'string' ? router.query.quizId : '';

  useEffect(() => {
    if (!router.isReady || !quizId) {
      return;
    }

    router.replace(`/interview/assessment?quizId=${encodeURIComponent(quizId)}`);
  }, [quizId, router]);

  return null;
};

export default QuizRedirectPage;
