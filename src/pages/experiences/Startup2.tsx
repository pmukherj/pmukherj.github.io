import React from 'react';
import { Link } from 'react-router-dom';
import VideoPlayer from '../../components/VideoPlayer';
const Startup2 = () => {
  return <div className="space-y-12">
      <section>
        <h1 className="text-4xl font-serif font-light mb-6">
          Startup 2: Robotics Systems
        </h1>
        <p className="text-lg text-gray-600">
          2015 - 2018 | Lead Robotics Engineer
        </p>
      </section>
      <div className="aspect-video w-full overflow-hidden rounded-sm border border-gray-200 mb-8">
        <VideoPlayer src="https://cdn.coverr.co/videos/coverr-robot-arm-in-a-factory-4865/1080p.mp4" poster="https://images.unsplash.com/photo-1580894732444-8ecded7900cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" className="w-full h-full" />
      </div>
      <section className="prose max-w-none">
        <p>
          At Startup 2, I led the robotics systems team focused on developing
          intelligent control systems for industrial automation. Our mission was
          to create more adaptive and flexible robotic systems that could work
          safely alongside human operators in manufacturing environments.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 not-prose">
          <div className="aspect-video border border-gray-200 rounded-sm overflow-hidden">
            <VideoPlayer src="https://cdn.coverr.co/videos/coverr-robotic-arm-at-work-5018/1080p.mp4" poster="https://images.unsplash.com/photo-1593073862407-a3ce22748763?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" className="w-full h-full" />
          </div>
          <div className="aspect-video border border-gray-200 rounded-sm overflow-hidden">
            <VideoPlayer src="https://cdn.coverr.co/videos/coverr-robots-moving-packages-1172/1080p.mp4" poster="https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" className="w-full h-full" />
          </div>
        </div>
        <h2>Key Contributions</h2>
        <ul>
          <li>
            Architected a modular robotics control platform that reduced
            integration time by 60%
          </li>
          <li>
            Led development of computer vision systems for real-time object
            detection and tracking
          </li>
          <li>
            Designed and implemented safety protocols for human-robot
            collaborative environments
          </li>
          <li>
            Managed a team of 7 engineers across robotics, computer vision, and
            embedded systems
          </li>
          <li>
            Secured two patents for novel approaches to adaptive robot control
          </li>
        </ul>
        <h2>Technologies and Methods</h2>
        <p>
          Our technology stack included ROS (Robot Operating System), C++ for
          low-level control systems, Python for higher-level behaviors, and
          custom FPGA implementations for real-time processing. We utilized a
          combination of traditional control theory approaches and machine
          learning techniques to achieve adaptive behavior.
        </p>
        <h2>Impact</h2>
        <p>
          The systems we developed were successfully deployed in three
          manufacturing facilities, resulting in a 25% increase in production
          efficiency and a 40% reduction in errors. Our approach to human-robot
          collaboration became a reference point in the industry and helped the
          company secure a $12M Series B funding round.
        </p>
        <h2>Key Lessons</h2>
        <p>
          This role taught me the critical importance of systems thinking when
          dealing with complex robotics applications. I learned how to
          effectively balance theoretical optimization with practical
          constraints like cost, reliability, and ease of maintenance. Most
          importantly, I developed a deeper understanding of how to translate
          customer needs into technical specifications and deliverable
          solutions.
        </p>
      </section>
      <div className="border-t border-gray-200 pt-8">
        <Link to="/experience" className="text-sm font-medium text-gray-900 underline">
          Back to all experience
        </Link>
      </div>
    </div>;
};
export default Startup2;