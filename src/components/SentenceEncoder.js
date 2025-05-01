import React, { useState, useEffect } from 'react';
// TensorFlow.js використовується при динамічному імпорті модулів
// eslint-disable-next-line no-unused-vars

const SentenceEncoder = () => {
  const [model, setModel] = useState(null);
  const [sentence1, setSentence1] = useState('');
  const [sentence2, setSentence2] = useState('');
  const [similarity, setSimilarity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [error, setError] = useState(null);

  // Завантаження моделі при монтуванні компонента
  useEffect(() => {
    const loadModel = async () => {
      try {
        // Динамічний імпорт моделі Universal Sentence Encoder
        const useModule = await import('@tensorflow-models/universal-sentence-encoder');
        
        const useModel = await useModule.load();
        setModel(useModel);
        setModelLoading(false);
      } catch (err) {
        console.error('Помилка завантаження моделі:', err);
        setError('Не вдалося завантажити модель Universal Sentence Encoder');
        setModelLoading(false);
      }
    };

    loadModel();
  }, []);

  // Функція для обчислення подібності між двома реченнями
  const calculateSimilarity = async () => {
    if (!sentence1.trim() || !sentence2.trim()) return;

    setLoading(true);
    setSimilarity(null);
    setError(null);

    try {
      // Отримання ембедінгів для обох речень
      const embeddings = await model.embed([sentence1, sentence2]);
      
      // Перетворення ембедінгів у тензори
      const embed1 = embeddings.arraySync()[0];
      const embed2 = embeddings.arraySync()[1];
      
      // Обчислення косинусної подібності
      const dotProduct = embed1.reduce((sum, val, i) => sum + val * embed2[i], 0);
      const norm1 = Math.sqrt(embed1.reduce((sum, val) => sum + val * val, 0));
      const norm2 = Math.sqrt(embed2.reduce((sum, val) => sum + val * val, 0));
      
      const similarityValue = dotProduct / (norm1 * norm2);
      setSimilarity(similarityValue);
    } catch (err) {
      console.error('Помилка при обчисленні подібності:', err);
      setError('Помилка при обчисленні подібності');
    } finally {
      setLoading(false);
    }
  };

  // Функція для візуалізації рівня подібності
  const renderSimilarityBar = () => {
    if (similarity === null) return null;
    
    const percentage = Math.round(similarity * 100);
    let colorClass = 'bg-red-500';
    
    if (percentage >= 80) {
      colorClass = 'bg-green-500';
    } else if (percentage >= 50) {
      colorClass = 'bg-yellow-500';
    } else if (percentage >= 30) {
      colorClass = 'bg-orange-500';
    }
    
    return (
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className={`h-4 rounded-full ${colorClass}`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="text-center mt-1">{percentage}%</div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Порівняння семантичної подібності речень</h1>
      
      {modelLoading ? (
        <div className="text-center py-4">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 rounded-full border-t-transparent animate-spin mr-2"></div>
            <p>Завантаження моделі Universal Sentence Encoder...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label htmlFor="sentence1" className="block text-sm font-medium text-gray-700 mb-2">
              Перше речення:
            </label>
            <textarea
              id="sentence1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
              value={sentence1}
              onChange={(e) => setSentence1(e.target.value)}
              placeholder="Введіть перше речення..."
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="sentence2" className="block text-sm font-medium text-gray-700 mb-2">
              Друге речення:
            </label>
            <textarea
              id="sentence2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
              value={sentence2}
              onChange={(e) => setSentence2(e.target.value)}
              placeholder="Введіть друге речення..."
            />
          </div>
          
          <button
            onClick={calculateSimilarity}
            disabled={loading || !sentence1.trim() || !sentence2.trim()}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Обчислюю...' : 'Порівняти речення'}
          </button>
          
          {similarity !== null && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-3">Результат порівняння:</h2>
              <p className="mb-2">
                Семантична подібність між реченнями:
              </p>
              {renderSimilarityBar()}
              <p className="mt-4 text-sm text-gray-600">
                <strong>Інтерпретація:</strong><br />
                90-100%: Речення майже ідентичні за змістом<br />
                70-89%: Дуже схожі речення<br />
                50-69%: Помірно подібні речення<br />
                30-49%: Слабка подібність<br />
                0-29%: Речення розрізняються за змістом
              </p>
            </div>
          )}
        </>
      )}

      <div className="mt-8 text-sm text-gray-500">
        <p>
          <strong>Про модель:</strong> Universal Sentence Encoder кодує речення в багатовимірні вектори, 
          які можна використовувати для визначення семантичної подібності, класифікації та інших завдань 
          обробки природної мови.
        </p>
      </div>
    </div>
  );
};

export default SentenceEncoder;