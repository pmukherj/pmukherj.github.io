import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ComingSoon from './pages/ComingSoon';
export function App() {
  return <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ComingSoon />} />
        </Route>
      </Routes>
    </BrowserRouter>;
}