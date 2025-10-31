import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatPage from './ChatPage';
import SuggestionPage from './SuggestionPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChatPage />} />
        <Route path="/suggestion" element={<SuggestionPage />} />
      </Routes>
    </Router>
  );
}

export default App;