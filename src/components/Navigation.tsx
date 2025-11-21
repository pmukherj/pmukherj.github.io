import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { MenuIcon, XIcon } from 'lucide-react';
const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems = [{
    name: 'Home',
    path: '/'
  }];
  return <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-serif tracking-tight">
            Prasenjit Mukherjee
          </Link>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map(item => <NavLink key={item.path} to={item.path} className={({
            isActive
          }) => `text-sm font-medium hover:text-gray-900 ${isActive ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-600'}`} end={item.path === '/'}>
                {item.name}
              </NavLink>)}
          </nav>
          {/* Mobile Navigation Button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
        {/* Mobile Navigation Menu */}
        {isMenuOpen && <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              {navItems.map(item => <NavLink key={item.path} to={item.path} className={({
            isActive
          }) => `text-sm font-medium py-2 ${isActive ? 'text-gray-900' : 'text-gray-600'}`} onClick={() => setIsMenuOpen(false)} end={item.path === '/'}>
                  {item.name}
                </NavLink>)}
            </nav>
          </div>}
      </div>
    </header>;
};
export default Navigation;