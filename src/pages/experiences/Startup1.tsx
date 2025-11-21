import React from 'react';
import { Link } from 'react-router-dom';
import VideoPlayer from '../../components/VideoPlayer';
const Startup1 = () => {
  return <div className="space-y-12">
      <section>
        <h1 className="text-4xl font-serif font-light mb-6">
          Startup 1: AI Research
        </h1>
        <p className="text-lg text-gray-600">
          2012 - 2015 | AI Research Scientist
        </p>
      </section>
      <div className="aspect-video w-full overflow-hidden rounded-sm border border-gray-200 mb-8">
        <VideoPlayer src="https://cdn.coverr.co/videos/coverr-close-up-of-an-ai-robot-1213/1080p.mp4" poster="https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" className="w-full h-full" />
      </div>
      <section className="prose max-w-none">
        <p>
          At Startup 1, I was part of the founding research team focused on
          developing novel reinforcement learning algorithms for autonomous
          decision-making systems. This was my first role after completing my
          PhD, allowing me to bridge academic research with practical
          applications.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 not-prose">
          <div className="aspect-video border border-gray-200 rounded-sm overflow-hidden">
            <VideoPlayer src="https://cdn.coverr.co/videos/coverr-neural-network-visualization-1575/1080p.mp4" poster="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" className="w-full h-full" />
          </div>
          <div className="aspect-video border border-gray-200 rounded-sm overflow-hidden">
            <VideoPlayer src="https://cdn.coverr.co/videos/coverr-ai-data-visualization-4279/1080p.mp4" poster="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" className="w-full h-full" />
          </div>
        </div>
        <h2>Key Contributions</h2>
        <ul>
          <li>
            Developed a novel approach to multi-agent reinforcement learning
            that improved convergence rates by 40%
          </li>
          <li>
            Led research resulting in 3 published papers in top AI conferences
            (ICML, NeurIPS)
          </li>
          <li>
            Created prototype demonstration systems that helped secure $5M in
            Series A funding
          </li>
          <li>
            Collaborated with engineering team to transition research algorithms
            into production code
          </li>
          <li>
            Mentored junior researchers and interns, establishing the company's
            research methodology
          </li>
        </ul>
        <h2>Technologies and Methods</h2>
        <p>
          My work primarily involved Python, TensorFlow (early versions), and
          custom simulation environments. I specialized in deep reinforcement
          learning approaches, particularly policy gradient methods and value
          function approximation techniques.
        </p>
        <h2>Impact</h2>
        <p>
          The research conducted during this period laid the groundwork for the
          company's core technology platform, which was eventually acquired by a
          major tech company in 2016. Our reinforcement learning approaches were
          particularly notable for their sample efficiency and stability in
          non-stationary environments.
        </p>
        <h2>Key Lessons</h2>
        <p>
          This experience taught me the importance of balancing theoretical
          innovation with practical implementation concerns. I learned how to
          effectively communicate complex technical concepts to non-technical
          stakeholders, including investors and potential clients. Most
          importantly, I developed a deep appreciation for the iterative nature
          of applied AI research.
        </p>
      </section>
      <div className="border-t border-gray-200 pt-8">
        <Link to="/experience" className="text-sm font-medium text-gray-900 underline">
          Back to all experience
        </Link>
      </div>
    </div>;
};
export default Startup1;