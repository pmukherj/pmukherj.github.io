import React from 'react';
import { Link } from 'react-router-dom';
import VideoPlayer from '../../components/VideoPlayer';
const Startup3Product1 = () => {
  return <div className="space-y-12">
      <section>
        <h1 className="text-4xl font-serif font-light mb-6">
          Startup 3: Computer Vision System
        </h1>
        <p className="text-lg text-gray-600">
          2018 - 2020 | Chief AI Architect
        </p>
      </section>
      <div className="aspect-video w-full overflow-hidden rounded-sm border border-gray-200 mb-8">
        <VideoPlayer src="https://cdn.coverr.co/videos/coverr-ai-robot-in-a-laboratory-8126/1080p.mp4" poster="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" className="w-full h-full" />
      </div>
      <section className="prose max-w-none">
        <p>
          As the first major product initiative at Startup 3, I led the
          development of an advanced computer vision system designed for
          autonomous navigation in complex environments. This product
          represented a significant technical challenge, requiring real-time
          processing and high reliability under variable conditions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 not-prose">
          <div className="aspect-video border border-gray-200 rounded-sm overflow-hidden">
            <VideoPlayer src="https://cdn.coverr.co/videos/coverr-autonomous-car-sensors-4027/1080p.mp4" poster="https://images.unsplash.com/photo-1617704548623-340376564e68?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" className="w-full h-full" />
          </div>
          <div className="aspect-video border border-gray-200 rounded-sm overflow-hidden">
            <VideoPlayer src="https://cdn.coverr.co/videos/coverr-computer-vision-in-action-4865/1080p.mp4" poster="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" className="w-full h-full" />
          </div>
        </div>
        <h2>Key Contributions</h2>
        <ul>
          <li>
            Architected end-to-end computer vision pipeline for environmental
            perception
          </li>
          <li>
            Developed novel deep learning approaches for semantic segmentation
            with limited training data
          </li>
          <li>
            Created simulation environments for accelerated testing and
            validation
          </li>
          <li>
            Implemented efficient deployment strategies for edge computing
            devices
          </li>
          <li>
            Led collaboration with hardware team to optimize for specific sensor
            configurations
          </li>
        </ul>
        <h2>Technologies and Methods</h2>
        <p>
          The system utilized a combination of traditional computer vision
          techniques and deep learning models, primarily implemented in PyTorch.
          We employed transfer learning approaches to maximize performance with
          limited training data and developed custom data augmentation
          pipelines. The deployment stack included optimized inference engines
          for various edge computing platforms.
        </p>
        <h2>Impact</h2>
        <p>
          This product became the company's flagship offering, achieving 95%
          accuracy in challenging environmental conditions where competing
          solutions typically achieved only 70-80%. The system was successfully
          deployed in autonomous vehicle testbeds and specialized industrial
          applications, generating the company's first $1M in recurring revenue.
        </p>
        <h2>Key Lessons</h2>
        <p>
          This project reinforced the importance of end-to-end thinking in AI
          product development. I learned valuable lessons about balancing
          algorithmic performance with practical constraints like power
          consumption, latency requirements, and hardware costs. The experience
          also highlighted the critical nature of robust testing methodologies
          for safety-critical AI systems.
        </p>
      </section>
      <div className="border-t border-gray-200 pt-8">
        <Link to="/experience" className="text-sm font-medium text-gray-900 underline">
          Back to all experience
        </Link>
      </div>
    </div>;
};
export default Startup3Product1;