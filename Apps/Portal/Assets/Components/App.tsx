import { useState } from 'react';

// Bentuk data harus selaras dengan IndexModel.DashboardData (camelCase via JsonSerializerDefaults.Web)
export interface DashboardData {
    userName: string;
    projects: number;
    openTasks: number;
}

const App = ({ initialData }: { initialData: DashboardData | null }) => {
    const [count, setCount] = useState(initialData?.openTasks ?? 0);

    return (
        <div className="bg-background border-border rounded-lg border p-8">
            <h2 className="text-mono mb-1 text-lg font-semibold">
                Halo, {initialData?.userName ?? 'Tamu'} 👋
            </h2>
            <p className="text-secondary-foreground mb-6 text-sm">
                Data awal dari Razor PageModel — {initialData?.projects ?? 0} project aktif.
            </p>

            <div className="bg-accent mb-5 rounded-xl p-8 text-center">
                <div className="text-primary mb-1 text-4xl font-extrabold">{count}</div>
                <div className="text-secondary-foreground text-sm">Open tasks (interaktif, state React)</div>
            </div>

            <div className="flex gap-3">
                <button
                    className="bg-primary text-primary-foreground rounded-md px-5 py-2.5 text-sm font-semibold"
                    onClick={() => setCount(count + 1)}
                >
                    Tambah
                </button>
                <button
                    className="btn-outline"
                    onClick={() => setCount(initialData?.openTasks ?? 0)}
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

export default App;
