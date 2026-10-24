import React from 'react';
import { createRoot } from 'react-dom/client';
import '../tokens.css';
import '../components.css';
import './catalog.css';
import { App } from './App';
import { ThemeProvider } from '../react';
createRoot(document.getElementById('root')!).render(<React.StrictMode><ThemeProvider><App/></ThemeProvider></React.StrictMode>);
