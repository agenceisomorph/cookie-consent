import { createRoot } from 'react-dom/client';
import { App } from './App';

// Pas de StrictMode : le double montage des effets en developpement fausserait
// le comptage des requetes reseau des tests de navigation.
const racine = document.getElementById('root');
if (!racine) throw new Error('Element #root absent de index.html');

createRoot(racine).render(<App />);
