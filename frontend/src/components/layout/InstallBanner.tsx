import { useState } from 'react';

export default function InstallBanner() {
  const [ferme, setFerme] = useState(false);

  if (ferme) return null;

  return (
    <div className="bg-blue-900 text-white px-4 py-2 flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <span>📲</span>
        <span className="font-medium">Installer l'application</span>
      </div>
      <button
        onClick={() => setFerme(true)}
        className="text-white/80 hover:text-white text-lg"
      >
        ✕
      </button>
    </div>
  );
}