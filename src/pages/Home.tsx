import React from 'react';
import { Link } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
const Home = () => {
  return <div className="space-y-12">
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-8">
          <div className="h-24 w-24 rounded-full bg-gray-200 overflow-hidden mb-4 md:mb-0">
            <img src="/images/pj-profile.jpeg" alt="Prasenjit Mukherjee" className="h-full w-full object-cover" />
          </div>
          <div>
            <h2 className="text-xl font-medium">Robotics and AI Engineer</h2>
            <p className="text-gray-600">
              13 years of experience in AI research and product development
            </p>
          </div>
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-serif font-light">About</h2>
        <div className="prose max-w-none">
          <p>
            I am a Robotics and AI engineer with a deep empathy for product
            development. Since graduating in 2012, I have dedicated my career to
            advancing the field of artificial intelligence through research,
            development, and practical applications.
          </p>
          <p>
            My work spans across multiple domains, including machine learning,
            computer vision, and robotics systems. I believe in creating AI
            solutions that not only push technical boundaries but also solve
            real-world problems and enhance human capabilities.
          </p>
          <p>
            Throughout my 13-year career, I have had the privilege of working
            with three innovative startups, helping to build cutting-edge
            technologies and products that have made meaningful impacts in their
            respective fields.
          </p>
        </div>
      </section>
      {/* Featured Project Video */}
      <section className="space-y-4">
        <h2 className="text-2xl font-serif font-light">Featured Project</h2>
        <div className="aspect-video w-full overflow-hidden rounded-sm border border-gray-200">
          <VideoPlayer src="https://cdn.coverr.co/videos/coverr-ai-robot-in-a-laboratory-8126/1080p.mp4" poster="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" className="w-full h-full" />
        </div>
        <p className="text-sm text-gray-600">
          Computer vision system for autonomous navigation — our flagship
          product at Startup 3
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-serif font-light">
          Experience Highlights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors overflow-hidden flex flex-col">
            <div className="h-40 overflow-hidden">
              <VideoPlayer src="https://cdn.coverr.co/videos/coverr-close-up-of-an-ai-robot-1213/1080p.mp4" poster="https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" className="w-full h-full" />
            </div>
            <div className="p-6">
              <h3 className="font-medium mb-2">Startup 1</h3>
              <p className="text-gray-600 mb-4">AI research and development</p>
              <Link to="/experience/startup1" className="text-gray-900 text-sm font-medium underline">
                Read more
              </Link>
            </div>
          </div>
          <div className="border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors overflow-hidden flex flex-col">
            <div className="h-40 overflow-hidden">
              <VideoPlayer src="https://cdn.coverr.co/videos/coverr-robot-arm-in-a-factory-4865/1080p.mp4" poster="https://images.unsplash.com/photo-1580894732444-8ecded7900cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" className="w-full h-full" />
            </div>
            <div className="p-6">
              <h3 className="font-medium mb-2">Startup 2</h3>
              <p className="text-gray-600 mb-4">
                Robotics systems architecture
              </p>
              <Link to="/experience/startup2" className="text-gray-900 text-sm font-medium underline">
                Read more
              </Link>
            </div>
          </div>
          <div className="border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors overflow-hidden flex flex-col">
            <div className="h-40 overflow-hidden">
              <VideoPlayer src="https://cdn.coverr.co/videos/coverr-digital-brain-connections-2580/1080p.mp4" poster="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" className="w-full h-full" />
            </div>
            <div className="p-6">
              <h3 className="font-medium mb-2">Startup 3</h3>
              <p className="text-gray-600 mb-4">
                Multiple AI product initiatives
              </p>
              <div className="flex flex-col space-y-2 mt-2">
                <Link to="/experience/startup3-product1" className="text-gray-900 text-sm font-medium underline">
                  Product 1
                </Link>
                <Link to="/experience/startup3-product2" className="text-gray-900 text-sm font-medium underline">
                  Product 2
                </Link>
                <Link to="/experience/startup3-product3" className="text-gray-900 text-sm font-medium underline">
                  Product 3
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Link to="/experience" className="text-sm font-medium text-gray-900 underline">
            View all experience
          </Link>
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-serif font-light">Recent Writing</h2>
        <div className="space-y-6">
          <article className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium mb-1">
              Advances in Reinforcement Learning for Robotic Control
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              Published on September 15, 2023
            </p>
            <p className="text-gray-600 mb-2">
              An exploration of recent breakthroughs in reinforcement learning
              algorithms and their applications in robotic control systems.
            </p>
            <Link to="/blog" className="text-sm font-medium text-gray-900 underline">
              Read more
            </Link>
          </article>
          <article className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium mb-1">
              The Intersection of Product Design and AI Development
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              Published on August 3, 2023
            </p>
            <p className="text-gray-600 mb-2">
              Reflections on creating AI products that balance technical
              sophistication with user-centered design principles.
            </p>
            <Link to="/blog" className="text-sm font-medium text-gray-900 underline">
              Read more
            </Link>
          </article>
        </div>
        <div className="mt-4">
          <Link to="/blog" className="text-sm font-medium text-gray-900 underline">
            View all posts
          </Link>
        </div>
      </section>
    </div>;
};
export default Home;