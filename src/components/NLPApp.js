import React, { useState, useEffect, Suspense } from 'react';
import * as tf from '@tensorflow/tfjs';

// Ліниве завантаження компонентів
const ToxicityDetector = React.lazy(() => import('./ToxicityDetector'));
const SentenceEncoder = React.lazy(() => import('./SentenceEncoder'));
const QnADemo = React.lazy(() => import('./QnADemo'));
const NLPToolkit = React.lazy(() => import('./NLPToolkit'));
const CombinedAnalyzer = React.lazy(() => import('./CombinedAnalyzer'));

const NLPApp = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [loadingBackend, setLoadingBackend] = useState(true);
  const [backendInfo, setBackendInfo] = useState(null);

  // Ініціалізація TensorFlow.js
  useEffect(() => {
    const setupTensorflowJS = async () => {
      try {
        // Перевірка WebGL
        const webGLAvailable = await tf.ready();
        
        // Спроба встановити WebGL backend
        await tf.setBackend('webgl');
        
        // Отримання інформації про backend
        const backend = tf.getBackend();
        const webGLInfo = backend === 'webgl' ? {
          version: tf.env().getNumber('WEBGL_VERSION'),
          device: "Not available in this TF.js version"
        } : null;
        
        setBackendInfo({
          name: backend,
          webGL: webGLInfo
        });
        
        setIsBackendReady(true);
      } catch (err) {
        console.error('Помилка ініціалізації TensorFlow.js:', err);
        // Резервний варіант - CPU
        await tf.setBackend('cpu');
        setBackendInfo({
          name: 'cpu',
          webGL: null
        });
        setIsBackendReady(true);
      } finally {
        setLoadingBackend(false);
      }
    };

    setupTensorflowJS();
  }, []);

  // Компоненти для різних вкладок
  const tabComponents = {
    home: () => (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">NLP застосунок на TensorFlow.js</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-blue-800">Вітаємо у застосунку аналізу природної мови!</h2>
          <p className="mb-4 text-gray-700">
            Цей застосунок демонструє можливості обробки природної мови безпосередньо у вашому браузері
            за допомогою TensorFlow.js. Всі обчислення виконуються локально на вашому пристрої, 
            забезпечуючи конфіденційність даних та швидку відповідь.
          </p>
          
          {loadingBackend ? (
            <div className="flex items-center justify-center p-4">
              <div className="w-6 h-6 border-2 border-blue-500 rounded-full border-t-transparent animate-spin mr-2"></div>
              <p>Ініціалізація TensorFlow.js...</p>
            </div>
          ) : isBackendReady ? (
            <div className="mb-4">
              <div className="bg-green-100 border border-green-300 rounded p-3 mb-4">
                <p className="text-green-800 font-medium">TensorFlow.js успішно ініціалізовано!</p>
                <p className="text-sm text-green-700">
                  Backend: <span className="font-medium">{backendInfo?.name}</span>
                  {backendInfo?.webGL && (
                    <> | WebGL версія: {backendInfo.webGL.version} | Графічний пристрій: {backendInfo.webGL.device}</>
                  )}
                </p>
              </div>
              <p className="text-gray-700">
                Ви можете використовувати наступні функції для обробки природної мови:
              </p>
            </div>
          ) : (
            <div className="bg-red-100 border border-red-300 rounded p-3 mb-4">
              <p className="text-red-800 font-medium">Помилка ініціалізації TensorFlow.js</p>
              <p className="text-sm text-red-700">
                Застосунок може працювати повільніше. Переконайтеся, що ваш браузер підтримує WebGL.
              </p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setActiveTab('toxicity')}
          >
            <h3 className="text-xl font-bold mb-2 text-indigo-700">Детектор токсичності</h3>
            <p className="text-gray-600 mb-3">
              Виявлення токсичного, образливого або недоречного вмісту в тексті за допомогою 
              моделі TensorFlow.js Text Toxicity.
            </p>
            <button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-4 py-2"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('toxicity');
              }}
            >
              Спробувати
            </button>
          </div>
          
          <div 
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setActiveTab('similarity')}
          >
            <h3 className="text-xl font-bold mb-2 text-green-700">Порівняння текстів</h3>
            <p className="text-gray-600 mb-3">
              Порівняння семантичної подібності текстів з використанням моделі Universal Sentence 
              Encoder для знаходження змістовної подібності.
            </p>
            <button 
              className="bg-green-600 hover:bg-green-700 text-white rounded-md px-4 py-2"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('similarity');
              }}
            >
              Спробувати
            </button>
          </div>
          
          <div 
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setActiveTab('qna')}
          >
            <h3 className="text-xl font-bold mb-2 text-amber-700">Питання та відповіді</h3>
            <p className="text-gray-600 mb-3">
              Знаходження відповідей на запитання в тексті використовуючи QnA модель, яка 
              вилучає релевантну інформацію з контексту.
            </p>
            <button 
              className="bg-amber-600 hover:bg-amber-700 text-white rounded-md px-4 py-2"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('qna');
              }}
            >
              Спробувати
            </button>
          </div>
          
          <div 
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setActiveTab('combined')}
          >
            <h3 className="text-xl font-bold mb-2 text-purple-700">Комплексний аналіз</h3>
            <p className="text-gray-600 mb-3">
              Використання всіх моделей разом для проведення комплексного аналізу тексту:
              токсичність, подібність та відповіді на запитання.
            </p>
            <button 
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-md px-4 py-2"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('combined');
              }}
            >
              Спробувати
            </button>
          </div>
          
          <div 
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setActiveTab('info')}
          >
            <h3 className="text-xl font-bold mb-2 text-blue-700">Інформація про NLP</h3>
            <p className="text-gray-600 mb-3">
              Дізнайтесь більше про можливості NLP у браузері, доступні моделі, їх продуктивність 
              та приклади використання.
            </p>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('info');
              }}
            >
              Дізнатися більше
            </button>
          </div>
        </div>
      </div>
    ),
    
    toxicity: () => <ToxicityDetector />,
    similarity: () => <SentenceEncoder />,
    qna: () => <QnADemo />,
    combined: () => <CombinedAnalyzer />,
    info: () => <NLPToolkit />
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Навігаційна панель */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <button 
                  onClick={() => setActiveTab('home')}
                  className="text-xl font-bold text-indigo-600 hover:text-indigo-800"
                >
                  NLP App
                </button>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setActiveTab('toxicity')}
                  className={`px-3 py-2 text-sm font-medium ${activeTab === 'toxicity' 
                    ? 'border-indigo-500 text-gray-900 border-b-2' 
                    : 'text-gray-500 hover:border-gray-300 hover:text-gray-700 border-transparent border-b-2'}`}
                >
                  Токсичність
                </button>
                <button
                  onClick={() => setActiveTab('similarity')}
                  className={`px-3 py-2 text-sm font-medium ${activeTab === 'similarity' 
                    ? 'border-indigo-500 text-gray-900 border-b-2' 
                    : 'text-gray-500 hover:border-gray-300 hover:text-gray-700 border-transparent border-b-2'}`}
                >
                  Подібність
                </button>
                <button
                  onClick={() => setActiveTab('qna')}
                  className={`px-3 py-2 text-sm font-medium ${activeTab === 'qna' 
                    ? 'border-indigo-500 text-gray-900 border-b-2' 
                    : 'text-gray-500 hover:border-gray-300 hover:text-gray-700 border-transparent border-b-2'}`}
                >
                  Питання
                </button>
                <button
                  onClick={() => setActiveTab('combined')}
                  className={`px-3 py-2 text-sm font-medium ${activeTab === 'combined' 
                    ? 'border-indigo-500 text-gray-900 border-b-2' 
                    : 'text-gray-500 hover:border-gray-300 hover:text-gray-700 border-transparent border-b-2'}`}
                >
                  Комбіновано
                </button>
                <button
                  onClick={() => setActiveTab('info')}
                  className={`px-3 py-2 text-sm font-medium ${activeTab === 'info' 
                    ? 'border-indigo-500 text-gray-900 border-b-2' 
                    : 'text-gray-500 hover:border-gray-300 hover:text-gray-700 border-transparent border-b-2'}`}
                >
                  Інформація
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <div className="text-sm font-medium">
                {!loadingBackend && isBackendReady && (
                  <span className={`px-2 py-1 rounded ${backendInfo?.name === 'webgl' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'}`}>
                    {backendInfo?.name === 'webgl' ? '⚡ WebGL' : '🔄 CPU'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Мобільне меню */}
      <div className="sm:hidden bg-white border-t border-gray-200">
        <div className="grid grid-cols-5 text-center">
          <button
            onClick={() => setActiveTab('toxicity')}
            className={`py-2 ${activeTab === 'toxicity' 
              ? 'text-indigo-600 border-t-2 border-indigo-500' 
              : 'text-gray-500'}`}
          >
            Токсичність
          </button>
          <button
            onClick={() => setActiveTab('similarity')}
            className={`py-2 ${activeTab === 'similarity' 
              ? 'text-indigo-600 border-t-2 border-indigo-500' 
              : 'text-gray-500'}`}
          >
            Подібність
          </button>
          <button
            onClick={() => setActiveTab('qna')}
            className={`py-2 ${activeTab === 'qna' 
              ? 'text-indigo-600 border-t-2 border-indigo-500' 
              : 'text-gray-500'}`}
          >
            Питання
          </button>
          <button
            onClick={() => setActiveTab('combined')}
            className={`py-2 ${activeTab === 'combined' 
              ? 'text-indigo-600 border-t-2 border-indigo-500' 
              : 'text-gray-500'}`}
          >
            Комбо
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`py-2 ${activeTab === 'info' 
              ? 'text-indigo-600 border-t-2 border-indigo-500' 
              : 'text-gray-500'}`}
          >
            Інфо
          </button>
        </div>
      </div>

      {/* Основний вміст */}
      <main className="py-6">
        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <div className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            <p className="ml-3 text-lg">Завантаження компонента...</p>
          </div>
        }>
          {tabComponents[activeTab]()}
        </Suspense>
      </main>

      {/* Футер */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Демонстраційний застосунок обробки природної мови на TensorFlow.js
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Усі моделі працюють локально у вашому браузері для забезпечення конфіденційності даних.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NLPApp;