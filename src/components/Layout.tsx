import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
const Layout = () => {
  return <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <Outlet />
      </main>
      <Footer />
    </div>;
};
export default Layout;