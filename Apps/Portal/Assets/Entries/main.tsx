import { createRoot } from 'react-dom/client';
import App, { type DashboardData } from '@app/Components/App';

// Elemen mount di-render Razor; data awal dari model server (Index.cshtml.cs)
// di-serialize ke attribute data-initial.
const rootElement = document.getElementById('root');

if (rootElement) {
    let initialData: DashboardData | null = null;
    try {
        initialData = rootElement.dataset.initial
            ? (JSON.parse(rootElement.dataset.initial) as DashboardData)
            : null;
    } catch {
        console.error('[speca] data-initial bukan JSON valid.');
    }

    createRoot(rootElement).render(<App initialData={initialData} />);
}
