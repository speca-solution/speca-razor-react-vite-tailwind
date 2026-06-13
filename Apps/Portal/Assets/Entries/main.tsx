import type { DashboardData } from '@app/Components/App';

// Di PRODUKSI, nonaktifkan React DevTools: hook global di-neutralkan SEBELUM
// react-dom dimuat (lewat dynamic import di bawah), sehingga renderer tidak
// mendaftar dan pohon komponen tak bisa diinspeksi. Di development
// (import.meta.env.DEV) dibiarkan agar DevTools tetap berguna.
if (!import.meta.env.DEV) {
    const hook = (window as unknown as {
        __REACT_DEVTOOLS_GLOBAL_HOOK__?: Record<string, unknown>;
    }).__REACT_DEVTOOLS_GLOBAL_HOOK__;

    if (hook && typeof hook === 'object') {
        for (const key of Object.keys(hook)) {
            hook[key] = typeof hook[key] === 'function' ? () => {} : null;
        }
    }
}

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

    // react-dom & App diimpor dinamis agar hook DevTools sempat dimatikan dulu.
    void (async () => {
        const [{ createRoot }, { default: App }] = await Promise.all([
            import('react-dom/client'),
            import('@app/Components/App'),
        ]);

        createRoot(rootElement).render(<App initialData={initialData} />);
    })();
}
