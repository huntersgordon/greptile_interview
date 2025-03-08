import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dev from './Dev'
import { MantineProvider } from '@mantine/core';

import ChangeLog from './ChangeLog'

import './App.css';



function App() {

  document.title = "Changelog Generator";

  return (
    <MantineProvider>
      <Router>
        <div className="App">
          <header className="App-header">
            <Routes>
              <Route path="/developer" element={<Dev />} />
              <Route path="/changes/:repoName" element={<ChangeLog />} />
            </Routes>
          </header>
        </div>
      </Router>
    </MantineProvider>
  );
}

export default App;
