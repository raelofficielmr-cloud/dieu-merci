import { useState, useRef, useEffect } from 'react';
import { iaService } from '../../services/iaService';
import { useAuth } from '../../context/AuthContext';

interface Message {
  role: 'user' | 'ia';
  contenu: string;
}

export default function IAChatbot() {
  const { role } = useAuth();
  const [ouvert, setOuvert] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ia',
      contenu:
        'Bonjour Papa ! 👋 Je suis votre assistant IA. Posez-moi une question sur votre entreprise.',
    },
  ]);
  const [saisie, setSaisie] = useState('');
  const [chargement, setChargement] = useState(false);
  const finMessagesRef = useRef<HTMLDivElement>(null);

  const estPapa = role === 'Proprietaire';

  useEffect(() => {
    finMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!estPapa) return null;

  const envoyer = async () => {
    if (!saisie.trim() || chargement) return;

    const question = saisie.trim();
    setMessages([...messages, { role: 'user', contenu: question }]);
    setSaisie('');
    setChargement(true);

    try {
      const reponse = await iaService.chat(question);
      setMessages((prev) => [...prev, { role: 'ia', contenu: reponse }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'ia', contenu: '❌ Erreur lors de la réponse. Réessayez.' },
      ]);
    } finally {
      setChargement(false);
    }
  };

  const suggestions = [
    'Combien j\'ai de ciment ?',
    'Quelles sont mes dettes ?',
    'Quel est le taux du jour ?',
    'Quels produits sont en rupture ?',
    'Valeur totale du stock ?',
  ];

  return (
    <>
      <button
        onClick={() => setOuvert(!ouvert)}
        className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-40 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all"
        title="Assistant IA"
      >
        {ouvert ? '✕' : '🤖'}
      </button>

      {ouvert && (
        <div className="fixed bottom-40 md:bottom-24 right-4 md:right-6 z-40 w-[calc(100vw-2rem)] max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[70vh]">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-t-lg">
            <h3 className="font-bold text-sm md:text-base">🤖 Assistant IA Dieu Merci</h3>
            <p className="text-xs opacity-90">Posez-moi une question</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[300px]">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
                  }`}
                >
                  {m.contenu}
                </div>
              </div>
            ))}

            {chargement && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg text-sm text-gray-500">
                  🤖 Réfléchit...
                </div>
              </div>
            )}

            <div ref={finMessagesRef} />
          </div>

          {messages.length <= 1 && (
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-[10px] text-gray-500 mb-2 px-1">💡 Suggestions :</p>
              <div className="flex flex-wrap gap-1">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSaisie(s)}
                    className="text-[10px] bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <input
              type="text"
              value={saisie}
              onChange={(e) => setSaisie(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && envoyer()}
              placeholder="Posez une question..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
              disabled={chargement}
            />
            <button
              onClick={envoyer}
              disabled={chargement || !saisie.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-bold"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}