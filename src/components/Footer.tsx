import React from 'react';
import { GithubIcon, LinkedinIcon, MailIcon } from 'lucide-react';
const Footer = () => {
  // Email obfuscation - constructs email dynamically to avoid spam bots
  const handleEmailClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const user = 'prashenjitmuk';
    const domain = 'gmail.com';
    const email = `${user}@${domain}`;
    window.location.href = `mailto:${email}`;
  };

  return <footer className="bg-white border-t border-gray-200 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-500 mb-4 md:mb-0">
            © {new Date().getFullYear()} Prasenjit Mukherjee. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="https://github.com/pmukherj" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900" aria-label="GitHub">
              <GithubIcon className="h-5 w-5" />
            </a>
            <a href="https://www.linkedin.com/in/prasenjitmukherjee/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900" aria-label="LinkedIn">
              <LinkedinIcon className="h-5 w-5" />
            </a>
            <a href="#" onClick={handleEmailClick} className="text-gray-500 hover:text-gray-900" aria-label="Email">
              <MailIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;