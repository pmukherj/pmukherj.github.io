import React from 'react';
import { Link } from 'react-router-dom';
const Blog = () => {
  const posts = [{
    id: 1,
    title: 'Advances in Reinforcement Learning for Robotic Control',
    date: 'September 15, 2023',
    excerpt: 'An exploration of recent breakthroughs in reinforcement learning algorithms and their applications in robotic control systems.',
    readingTime: '8 min read',
    tags: ['Reinforcement Learning', 'Robotics', 'AI']
  }, {
    id: 2,
    title: 'The Intersection of Product Design and AI Development',
    date: 'August 3, 2023',
    excerpt: 'Reflections on creating AI products that balance technical sophistication with user-centered design principles.',
    readingTime: '6 min read',
    tags: ['Product Design', 'AI Development', 'UX']
  }, {
    id: 3,
    title: 'Ethical Considerations in Autonomous Systems',
    date: 'July 12, 2023',
    excerpt: 'Exploring the ethical challenges and considerations when developing autonomous systems that interact with humans and make decisions.',
    readingTime: '10 min read',
    tags: ['Ethics', 'AI', 'Autonomous Systems']
  }, {
    id: 4,
    title: 'Transfer Learning in Computer Vision Applications',
    date: 'June 28, 2023',
    excerpt: 'How transfer learning is revolutionizing computer vision applications by enabling more efficient training with less data.',
    readingTime: '7 min read',
    tags: ['Computer Vision', 'Transfer Learning', 'Deep Learning']
  }, {
    id: 5,
    title: 'Building Effective AI Research Teams',
    date: 'May 15, 2023',
    excerpt: 'Insights from my experience building and leading multidisciplinary AI research teams across different organizational contexts.',
    readingTime: '9 min read',
    tags: ['Team Building', 'AI Research', 'Leadership']
  }];
  return <div className="space-y-12">
      <section>
        <h1 className="text-4xl font-serif font-light mb-6">Blog</h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Thoughts, insights, and experiences from 13 years in AI and robotics
          research and development.
        </p>
      </section>
      <section className="space-y-12">
        {posts.map(post => <article key={post.id} className="border-b border-gray-200 pb-8">
            <h2 className="text-2xl font-medium mb-2">
              <Link to={`#`} className="hover:underline">
                {post.title}
              </Link>
            </h2>
            <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
              <span>{post.date}</span>
              <span>•</span>
              <span>{post.readingTime}</span>
            </div>
            <p className="text-gray-600 mb-4">{post.excerpt}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map(tag => <span key={tag} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  {tag}
                </span>)}
            </div>
            <Link to={`#`} className="text-sm font-medium text-gray-900 underline">
              Read full post
            </Link>
          </article>)}
      </section>
    </div>;
};
export default Blog;