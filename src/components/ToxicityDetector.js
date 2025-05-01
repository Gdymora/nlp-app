import React, { useState, useEffect } from 'react';
// TensorFlow.js використовується при динамічному імпорті модулів
// eslint-disable-next-line no-unused-vars

const ToxicityDetector = () => {
  const [model, setModel] = useState(null);
  const [text, setText] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [error, setError] = useState(null);

  // Завантаження моделі при монтуванні компонента
  useEffect(() => {
    const loadModel = async () => {
      try {
        // Динамічний імпорт моделі токсичності
        const toxicityModule = await import('@tensorflow-models/toxicity');
        
        // Мінімальна оцінка класифікації, яку слід повернути
        const threshold = 0.9;
        
        // Завантаження моделі токсичності
        const toxicityModel = await toxicityModule.load(threshold);
        setModel(toxicityModel);
        setModelLoading(false);
      } catch (err) {
        console.error('Помилка завантаження моделі:', err);
        setError('Не вдалося завантажити модель');
        setModelLoading(false);
      }
    };

    loadModel();
  }, []);

  const analyzeText = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setResults(null);
    setError(null);

    try {
      const predictions = await model.classify(text);
      setResults(predictions);
    } catch (err) {
      console.error('Помилка при аналізі тексту:', err);
      setError('Помилка при аналізі тексту');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Детектор токсичного вмісту</h1>
      
      {modelLoading ? (
        <div className="text-center py-4">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 rounded-full border-t-transparent animate-spin mr-2"></div>
            <p>Завантаження моделі...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label htmlFor="textInput" className="block text-sm font-medium text-gray-700 mb-2">
              Введіть текст для аналізу:
            </label>
            <textarea
              id="textInput"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Введіть текст для аналізу на наявність токсичного вмісту..."
            />
          </div>
          
          <button
            onClick={analyzeText}
            disabled={loading || !text.trim()}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Аналізую...' : 'Аналізувати'}
          </button>
          
          {results && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-3">Результати аналізу:</h2>
              <div className="space-y-2">
                {results.map((result) => (
                  <div key={result.label} className="border-b pb-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{translateLabel(result.label)}:</span>
                      <span className={result.results[0].match ? "text-red-600 font-bold" : "text-green-600"}>
                        {result.results[0].match ? 'Виявлено' : 'Не виявлено'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Ймовірність: {(result.results[0].probabilities[1] * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-8 text-sm text-gray-500">
        <p>
          <strong>Примітка:</strong> Модель токсичності TensorFlow.js розпізнає такі типи токсичного контенту:
          образливі вислови, напад, загрози, непристойності, грубість, токсичність, ненависть.
        </p>
      </div>
    </div>
  );
};

// Функція для перекладу назв категорій
function translateLabel(label) {
  const labels = {
    'identity_attack': 'Напад на ідентичність',
    'insult': 'Образа',
    'obscene': 'Непристойність',
    'severe_toxicity': 'Сильна токсичність',
    'sexual_explicit': 'Сексуальний контент',
    'threat': 'Загроза',
    'toxicity': 'Токсичність'
  };
  
  return labels[label] || label;
}

export default ToxicityDetector;