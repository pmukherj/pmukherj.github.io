import React from 'react';
import { Link } from 'react-router-dom';
const Experience = () => {
  return <div className="space-y-12">
      <section>
        <h1 className="text-4xl font-serif font-light mb-6">
          Professional Experience
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Over 13 years working at the intersection of artificial intelligence,
          robotics, and product development.
        </p>
      </section>
      <section className="space-y-12">
        <div className="space-y-6">
          <h2 className="text-2xl font-serif font-light border-b border-gray-200 pb-2">
            Startup 3
          </h2>
          <p className="text-gray-600">2018 - Present | Chief AI Architect</p>
          <div className="prose max-w-none">
            <p>
              Leading AI strategy and development across multiple product
              initiatives, focusing on creating scalable and robust AI systems
              that solve complex real-world problems.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="border border-gray-200 p-6 rounded-sm">
              <h3 className="font-medium mb-2">Product 1</h3>
              <p className="text-gray-600 mb-4">
                Computer vision system for autonomous navigation
              </p>
              <Link to="/experience/startup3-product1" className="text-gray-900 text-sm font-medium underline">
                View details
              </Link>
            </div>
            <div className="border border-gray-200 p-6 rounded-sm">
              <h3 className="font-medium mb-2">Product 2</h3>
              <p className="text-gray-600 mb-4">
                Natural language processing for customer service automation
              </p>
              <Link to="/experience/startup3-product2" className="text-gray-900 text-sm font-medium underline">
                View details
              </Link>
            </div>
            <div className="border border-gray-200 p-6 rounded-sm">
              <h3 className="font-medium mb-2">Product 3</h3>
              <p className="text-gray-600 mb-4">
                Predictive analytics platform for business intelligence
              </p>
              <Link to="/experience/startup3-product3" className="text-gray-900 text-sm font-medium underline">
                View details
              </Link>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <h2 className="text-2xl font-serif font-light border-b border-gray-200 pb-2">
            Startup 2
          </h2>
          <p className="text-gray-600">2015 - 2018 | Lead Robotics Engineer</p>
          <div className="prose max-w-none">
            <p>
              Designed and implemented robotic control systems for industrial
              automation, focusing on machine learning approaches to improve
              precision and efficiency.
            </p>
            <p>
              Led a team of engineers in developing novel approaches to
              robot-human collaboration in manufacturing environments.
            </p>
          </div>
          <div className="mt-4">
            <Link to="/experience/startup2" className="text-gray-900 text-sm font-medium underline">
              Read full case study
            </Link>
          </div>
        </div>
        <div className="space-y-6">
          <h2 className="text-2xl font-serif font-light border-b border-gray-200 pb-2">
            Startup 1
          </h2>
          <p className="text-gray-600">2012 - 2015 | AI Research Scientist</p>
          <div className="prose max-w-none">
            <p>
              Conducted foundational research in reinforcement learning
              algorithms, contributing to several published papers and patent
              applications.
            </p>
            <p>
              Developed prototype systems demonstrating practical applications
              of theoretical AI research in real-world scenarios.
            </p>
          </div>
          <div className="mt-4">
            <Link to="/experience/startup1" className="text-gray-900 text-sm font-medium underline">
              Read full case study
            </Link>
          </div>
        </div>
      </section>
    </div>;
};
export default Experience;