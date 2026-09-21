import Layout from '../components/layout/Layout';
import { useTheme } from '../context/ThemeContext';

export default function ModeSombre() {
  const { sombre, basculer } = useTheme();

  return (
    <Layout>
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-xl font-bold text-dm-bordeaux">Mode Sombre</h2>
        <p className="text-gray-500 mt-2">Basculez entre le thème clair et sombre</p>

        <button
          onClick={basculer}
          className="mt-4 bg-dm-bordeaux text-white px-4 py-2 rounded-lg font-bold hover:bg-red-900 transition-colors"
        >
          {sombre ? '☀️ Passer en clair' : '🌙 Passer en sombre'}
        </button>

        <p className="text-sm text-gray-500 mt-2">
          Mode actuel : <strong>{sombre ? 'Sombre' : 'Clair'}</strong>
        </p>
      </div>
    </Layout>
  );
}