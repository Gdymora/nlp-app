import React, { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';

const CombinedAnalyzer = () => {
  // Стан для моделей
  const [models, setModels] = useState({
    use: null,
    toxicity: null,
    qna: null
  });
  
  // Стан для завантаження моделей
  const [loading, setLoading] = useState({
    use: true,
    toxicity: true,
    qna: true
  });
  
  // Стан для відстеження помилок
  const [errors, setErrors] = useState({
    use: null,
    toxicity: null,
    qna: null
  });
  
  // Текст для аналізу
  const [text, setText] = useState('');
  const [referenceText, setReferenceText] = useState('');
  const [question, setQuestion] = useState('');
  
  // Результати аналізу
  const [results, setResults] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Приклади текстів
  const sampleText = "TensorFlow.js - це бібліотека машинного навчання JavaScript, яка дозволяє розробникам створювати, навчати та запускати моделі машинного навчання у браузері та в середовищі Node.js. Вона була випущена Google у 2018 році.";
  const sampleReferenceText = "TensorFlow.js є JavaScript-бібліотекою для машинного навчання, що працює в браузері та Node.js.";
  const sampleQuestion = "Коли був випущений TensorFlow.js?";
  
  // Завантаження всіх моделей при монтуванні компоненту
  useEffect(() => {
    const loadModels = async () => {
      // Завантаження Universal Sentence Encoder
      try {
        const useModule = await import('@tensorflow-models/universal-sentence-encoder');
        const useModel = await useModule.load();
        setModels(prev => ({ ...prev, use: useModel }));
        setLoading(prev => ({ ...prev, use: false }));
      } catch (err) {
        console.error('Помилка завантаження USE:', err);
        setErrors(prev => ({ ...prev, use: 'Не вдалося завантажити Universal Sentence Encoder' }));
        setLoading(prev => ({ ...prev, use: false }));
      }
      
      // Завантаження моделі токсичності
      try {
        const toxicityModule = await import('@tensorflow-models/toxicity');
        const toxicityModel = await toxicityModule.load(0.9);
        setModels(prev => ({ ...prev, toxicity: toxicityModel }));
        setLoading(prev => ({ ...prev, toxicity: false }));
      } catch (err) {
        console.error('Помилка завантаження Toxicity:', err);
        setErrors(prev => ({ ...prev, toxicity: 'Не вдалося завантажити модель токсичності' }));
        setLoading(prev => ({ ...prev, toxicity: false }));
      }
      
      // Завантаження QnA моделі
      try {
        const qnaModule = await import('@tensorflow-models/qna');
        const qnaModel = await qnaModule.load();
        setModels(prev => ({ ...prev, qna: qnaModel }));
        setLoading(prev => ({ ...prev, qna: false }));
      } catch (err) {
        console.error('Помилка завантаження QnA:', err);
        setErrors(prev => ({ ...prev, qna: 'Не вдалося завантажити модель QnA' }));
        setLoading(prev => ({ ...prev, qna: false }));
      }
    };
    
    loadModels();
  }, []);
  
  // Функція для перевірки готовності всіх моделей
  const areAllModelsReady = () => {
    return models.use !== null && models.toxicity !== null && models.qna !== null;
  };
  
  // Функція для аналізу токсичності
  const analyzeToxicity = async (text) => {
    if (!models.toxicity) return null;
    
    try {
      const predictions = await models.toxicity.classify(text);
      
      // Перетворення результатів в більш зручний формат
      const results = {};
      predictions.forEach(prediction => {
        results[prediction.label] = {
          match: prediction.results[0].match,
          probability: prediction.results[0].probabilities[1]
        };
      });
      
      // Загальний висновок про токсичність
      const toxicLabels = predictions
        .filter(p => p.results[0].match)
        .map(p => p.label);
      const isToxic = toxicLabels.length > 0;
      
      return {
        isToxic,
        toxicLabels,
        details: results
      };
    } catch (error) {
      console.error('Помилка аналізу токсичності:', error);
      return null;
    }
  };
  
  // Функція для обчислення семантичної подібності
  const calculateSimilarity = async (text1, text2) => {
    if (!models.use || !text1 || !text2) return null;
    
    try {
      const embeddings = await models.use.embed([text1, text2]);
      
      // Перетворення ембедінгів у масиви
      const embed1 = embeddings.arraySync()[0];
      const embed2 = embeddings.arraySync()[1];
      
      // Обчислення косинусної подібності
      const dotProduct = embed1.reduce((sum, val, i) => sum + val * embed2[i], 0);
      const norm1 = Math.sqrt(embed1.reduce((sum, val) => sum + val * val, 0));
      const norm2 = Math.sqrt(embed2.reduce((sum, val) => sum + val * val, 0));
      
      const similarity = dotProduct / (norm1 * norm2);
      
      return {
        similarity,
        percentage: similarity * 100
      };
    } catch (error) {
      console.error('Помилка обчислення подібності:', error);
      return null;
    }
  };
  
  // Функція для пошуку відповіді на запитання
  const findAnswer = async (question, context) => {
    if (!models.qna || !question || !context) return null;
    
    try {
      const answers = await models.qna.findAnswers(question, context);
      return answers;
    } catch (error) {
      console.error('Помилка пошуку відповіді:', error);
      return null;
    }
  };
  
  // Функція для комплексного аналізу тексту
  const runCompleteAnalysis = async () => {
    if (!areAllModelsReady() || !text) return;
    
    setAnalyzing(true);
    setResults(null);
    
    try {
      // Запускаємо всі аналізи паралельно
      const [toxicityResult, similarityResult, qnaResult] = await Promise.all([
        analyzeToxicity(text),
        referenceText ? calculateSimilarity(text, referenceText) : Promise.resolve(null),
        question ? findAnswer(question, text) : Promise.resolve(null)
      ]);
      
      // Зберігаємо результати всіх аналізів
      setResults({
        text,
        timestamp: new Date().toISOString(),
        toxicity: toxicityResult,
        similarity: similarityResult,
        qna: qnaResult
      });
    } catch (error) {
      console.error('Помилка при комплексному аналізі:', error);
    } finally {
      setAnalyzing(false);
    }
  };
  
  // Функція для використання зразків
  const useSamples = () => {
    setText(sampleText);
    setReferenceText(sampleReferenceText);
    setQuestion(sampleQuestion);
  };
  
  // Функція для перекладу назв категорій токсичності
  const translateLabel = (label) => {
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
  };
  
  // Перевірка чи всі моделі завантажені
  const isLoading = loading.use || loading.toxicity || loading.qna;
  const hasError = errors.use || errors.toxicity || errors.qna;
  
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Комплексний аналіз тексту</h1>
      
      {/* Статус завантаження моделей */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <h2 className="text-xl font-semibold mb-3">Статус моделей</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`p-3 rounded-md ${loading.use 
              ? 'bg-yellow-50 border border-yellow-200' 
              : errors.use 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-green-50 border border-green-200'}`}>
              <div className="flex items-center">
                {loading.use ? (
                  <div className="w-4 h-4 border-2 border-yellow-500 rounded-full border-t-transparent animate-spin mr-2"></div>
                ) : errors.use ? (
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
                <span className={`font-medium ${loading.use 
                  ? 'text-yellow-700' 
                  : errors.use 
                    ? 'text-red-700' 
                    : 'text-green-700'}`}>
                  Universal Sentence Encoder
                </span>
              </div>
              {errors.use && <p className="text-sm text-red-600 mt-1">{errors.use}</p>}
            </div>
            
            <div className={`p-3 rounded-md ${loading.toxicity 
              ? 'bg-yellow-50 border border-yellow-200' 
              : errors.toxicity 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-green-50 border border-green-200'}`}>
              <div className="flex items-center">
                {loading.toxicity ? (
                  <div className="w-4 h-4 border-2 border-yellow-500 rounded-full border-t-transparent animate-spin mr-2"></div>
                ) : errors.toxicity ? (
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
                <span className={`font-medium ${loading.toxicity 
                  ? 'text-yellow-700' 
                  : errors.toxicity 
                    ? 'text-red-700' 
                    : 'text-green-700'}`}>
                  Модель токсичності
                </span>
              </div>
              {errors.toxicity && <p className="text-sm text-red-600 mt-1">{errors.toxicity}</p>}
            </div>
            
            <div className={`p-3 rounded-md ${loading.qna 
              ? 'bg-yellow-50 border border-yellow-200' 
              : errors.qna 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-green-50 border border-green-200'}`}>
              <div className="flex items-center">
                {loading.qna ? (
                  <div className="w-4 h-4 border-2 border-yellow-500 rounded-full border-t-transparent animate-spin mr-2"></div>
                ) : errors.qna ? (
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
                <span className={`font-medium ${loading.qna 
                  ? 'text-yellow-700' 
                  : errors.qna 
                    ? 'text-red-700' 
                    : 'text-green-700'}`}>
                  Модель QnA
                </span>
              </div>
              {errors.qna && <p className="text-sm text-red-600 mt-1">{errors.qna}</p>}
            </div>
          </div>
        </div>
      </div>
      
      {/* Форма для введення тексту */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
        <div className="mb-4">
          <label htmlFor="mainText" className="block text-sm font-medium text-gray-700 mb-2">
            Основний текст для аналізу:
          </label>
          <textarea
            id="mainText"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="5"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Введіть текст для аналізу..."
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="referenceText" className="block text-sm font-medium text-gray-700 mb-2">
              Текст для порівняння (опціонально):
            </label>
            <textarea
              id="referenceText"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              value={referenceText}
              onChange={(e) => setReferenceText(e.target.value)}
              placeholder="Введіть текст для семантичного порівняння..."
            />
          </div>
          
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
              Запитання до тексту (опціонально):
            </label>
            <textarea
              id="question"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Поставте запитання до основного тексту..."
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 justify-center">
          <button 
            onClick={useSamples}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            disabled={isLoading}
          >
            Використати приклади
          </button>
          
          <button 
            onClick={runCompleteAnalysis}
            disabled={isLoading || analyzing || !text}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition duration-200 disabled:opacity-50"
          >
            {analyzing ? 'Аналізую...' : 'Проаналізувати текст'}
          </button>
        </div>
      </div>
      
      {/* Результати аналізу */}
      {results && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4">Результати комплексного аналізу</h2>
          
          {/* Результати аналізу токсичності */}
          {results.toxicity && (
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3 text-indigo-700">Аналіз токсичності</h3>
              
              <div className={`p-4 rounded-lg mb-4 ${results.toxicity.isToxic 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-green-50 border border-green-200'}`}>
                <div className="flex items-center">
                  {results.toxicity.isToxic ? (
                    <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  )}
                  <span className={`font-semibold ${results.toxicity.isToxic ? 'text-red-700' : 'text-green-700'}`}>
                    {results.toxicity.isToxic 
                      ? 'Текст містить ознаки токсичного вмісту' 
                      : 'Токсичного вмісту не виявлено'}
                  </span>
                </div>
                
                {results.toxicity.isToxic && (
                  <div className="mt-2 pl-8">
                    <p className="text-red-700">Виявлені категорії токсичності:</p>
                    <ul className="list-disc pl-5 mt-1 text-red-600">
                      {results.toxicity.toxicLabels.map(label => (
                        <li key={label}>{translateLabel(label)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Детальні результати по категоріях */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(results.toxicity.details).map(([label, detail]) => (
                  <div key={label} className="border rounded-md p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{translateLabel(label)}</span>
                      <span className={detail.match ? "text-red-600 font-bold" : "text-green-600"}>
                        {detail.match ? 'Виявлено' : 'Не виявлено'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${detail.match ? 'bg-red-500' : 'bg-green-500'}`} 
                        style={{ width: `${detail.probability * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 text-right mt-1">
                      {(detail.probability * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Результати аналізу подібності */}
          {results.similarity && (
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3 text-green-700">Семантична подібність</h3>
              
              <div className="p-4 border rounded-lg">
                <p className="mb-2">Порівняння основного тексту з:</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mb-4 border border-gray-200">
                  {referenceText}
                </p>
                
                <div className="mb-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Рівень подібності:</span>
                    <span className="text-sm font-bold">
                      {results.similarity.percentage.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full ${
                        results.similarity.percentage >= 80 ? 'bg-green-500' :
                        results.similarity.percentage >= 50 ? 'bg-yellow-500' :
                        results.similarity.percentage >= 30 ? 'bg-orange-500' : 'bg-red-500'
                      }`} 
                      style={{ width: `${results.similarity.percentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mt-4">
                  <p className="font-medium mb-1">Інтерпретація:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li className={results.similarity.percentage >= 90 ? 'font-semibold text-green-700' : ''}>
                      90-100%: Речення майже ідентичні за змістом
                    </li>
                    <li className={results.similarity.percentage >= 70 && results.similarity.percentage < 90 ? 'font-semibold text-green-600' : ''}>
                      70-89%: Дуже схожі речення
                    </li>
                    <li className={results.similarity.percentage >= 50 && results.similarity.percentage < 70 ? 'font-semibold text-yellow-600' : ''}>
                      50-69%: Помірно подібні речення
                    </li>
                    <li className={results.similarity.percentage >= 30 && results.similarity.percentage < 50 ? 'font-semibold text-orange-600' : ''}>
                      30-49%: Слабка подібність
                    </li>
                    <li className={results.similarity.percentage < 30 ? 'font-semibold text-red-600' : ''}>
                      0-29%: Речення розрізняються за змістом
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* Результати QnA */}
          {results.qna && results.qna.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3 text-amber-700">Відповіді на запитання</h3>
              
              <div className="p-4 border rounded-lg">
                <div className="mb-4">
                  <p className="font-medium">Запитання:</p>
                  <p className="bg-amber-50 p-2 rounded border border-amber-200 mt-1">{question}</p>
                </div>
                
                <p className="font-medium mb-2">Знайдені відповіді:</p>
                <div className="space-y-3">
                  {results.qna.map((answer, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-gray-50">
                      <div className="mb-2">
                        <span className="font-semibold">Відповідь {index + 1}:</span> {answer.text}
                      </div>
                      <div className="text-sm text-gray-600">
                        Впевненість: {(answer.score * 100).toFixed(1)}%
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Фрагмент контексту:</span>
                        <p className="mt-1 p-2 bg-white rounded border border-gray-200">
                          {text.substring(0, answer.startIndex)}
                          <span className="bg-yellow-200 font-medium">{text.substring(answer.startIndex, answer.endIndex)}</span>
                          {text.substring(answer.endIndex)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {results.qna && results.qna.length === 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3 text-amber-700">Відповіді на запитання</h3>
              <div className="p-4 border rounded-lg bg-yellow-50">
                <div className="flex items-center text-yellow-700">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span className="font-medium">Модель не змогла знайти відповідь на запитання в поданому тексті.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CombinedAnalyzer;