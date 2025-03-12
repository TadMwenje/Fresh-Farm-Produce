import React from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import IndexPage from './components/IndexPage';
import FarmSalesPage from './components/FarmSalesPage';

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Index</Link>
            </li>
            <li>
              <Link to="/farm-sales">Farm Sales</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/farm-sales" element={<FarmSalesPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;