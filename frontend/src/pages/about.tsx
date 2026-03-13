'use client';

import React from 'react';
import Layout from '@/layouts/MainLayout';

const About: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold mb-6">About CodeMaster</h1>
        <p className="text-gray-300 text-lg mb-6">
          CodeMaster is an interview preparation platform designed to help developers improve problem-solving skills through hands-on coding challenges.
        </p>
        <p className="text-gray-400 mb-4">
          The platform combines curated coding problems, a browser-based editor, and submission tracking so you can practice consistently and measure progress.
        </p>
        <p className="text-gray-400">
          Build your confidence, sharpen your fundamentals, and prepare for real interview scenarios with structured practice.
        </p>
      </div>
    </Layout>
  );
};

export default About;
