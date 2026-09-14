import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { applyBirthdayMode } from './lib/birthday'
import './index.css'

// Must run before render: the palette is sampled once by the canvas backdrop.
applyBirthdayMode();

createRoot(document.getElementById("root")!).render(<App />);
