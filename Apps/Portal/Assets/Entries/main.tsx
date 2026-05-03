import { createRoot } from 'react-dom/client';
import App from '@app/Components/App';

// Mengambil elemen yang sudah di-render oleh Razor di server
const rootElement = document.getElementById('root');

if (rootElement) {
    // 'Hydrate' HTML tersebut agar menjadi komponen React aktif
    createRoot(rootElement).render(<App />);
}
