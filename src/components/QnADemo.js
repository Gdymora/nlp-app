import React, { useState, useEffect } from 'react';
// TensorFlow.js використовується при динамічному імпорті модулів
// eslint-disable-next-line no-unused-vars

const QnADemo = () => {
  const [model, setModel] = useState(null);
  const [context, setContext] = useState('');
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailedError, setDetailedError] = useState(null);

  // Приклад контексту для демонстрації
  const sampleContext = `TensorFlow.js - це бібліотека машинного навчання JavaScript, яка дозволяє розробникам 
  створювати, навчати та запускати моделі машинного навчання у браузері та в середовищі Node.js. 
  Вона була випущена Google у 2018 році. TensorFlow.js надає API для визначення моделей з нуля, а також API для 
  запуску попередньо навчених моделей. Бібліотека також підтримує передачу даних з Python TensorFlow та 
  використання попередньо навчених моделей із TensorFlow Hub. TensorFlow.js підтримує навчання моделей 
  безпосередньо у браузері, що дозволяє розробникам створювати інтерактивні моделі машинного навчання, які 
  працюють повністю на стороні клієнта. Це особливо корисно для застосунків, що потребують приватності, 
  оскільки дані користувача не потрібно надсилати на сервер. TensorFlow.js використовує WebGL для прискорення 
  обчислень за допомогою GPU, що дозволяє швидко навчати та запускати моделі.`;

  // Завантаження моделі при монтуванні компонента
  useEffect(() => {
    const loadModel = async () => {
      try {
        setModelLoading(true);
        setError(null);
        setDetailedError(null);
        
        // Спробуємо виправити версійність
        const tf = await import('@tensorflow/tfjs');
        console.log('TensorFlow.js версія:', tf.version);
        
        // Переконаємось що backend ініціалізований
        await tf.ready();
        console.log('Поточний TensorFlow backend:', tf.getBackend());
        
        // Спробуємо перемкнутися на CPU, якщо є проблеми з WebGL
        try {
          await tf.setBackend('webgl');
          console.log('Використовуємо WebGL backend');
        } catch (e) {
          console.warn('Не вдалося використати WebGL, переключаємось на CPU:', e);
          await tf.setBackend('cpu');
          console.log('Використовуємо CPU backend');
        }
        
        // Динамічний імпорт QnA моделі
        console.log('Починаємо завантаження моделі QnA...');
        
        try {
          const qnaModule = await import('@tensorflow-models/qna');
          console.log('Модуль QnA успішно імпортовано:', qnaModule);
          
          console.log('Завантаження моделі QnA...');
          const loadedModel = await qnaModule.load();
          console.log('Модель QnA завантажена успішно:', loadedModel);
          
          setModel(loadedModel);
          setContext(sampleContext);
          setError(null);
        } catch (qnaError) {
          console.error('Помилка завантаження або ініціалізації QnA моделі:', qnaError);
          setError('Не вдалося завантажити модель QnA. Спробуйте перезавантажити сторінку або використати інший браузер.');
          setDetailedError(qnaError.toString());
        }
      } catch (err) {
        console.error('Загальна помилка завантаження TensorFlow.js або моделі QnA:', err);
        setError('Не вдалося завантажити TensorFlow.js або модель QnA');
        setDetailedError(err.toString());
      } finally {
        setModelLoading(false);
      }
    };

    loadModel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Функція для отримання відповіді на запитання
  const answerQuestion = async () => {
    if (!question.trim() || !context.trim()) return;

    setLoading(true);
    setAnswers([]);
    setError(null);

    try {
      const result = await model.findAnswers(question, context);
      setAnswers(result);
      
      if (result.length === 0) {
        setError('Модель не змогла знайти відповідь на це запитання у поданому контексті');
      }
    } catch (err) {
      console.error('Помилка при пошуку відповіді:', err);
      setError('Помилка при пошуку відповіді');
    } finally {
      setLoading(false);
    }
  };

  // Функція для виділення тексту відповіді в контексті
  const highlightText = (text, start, end) => {
    return (
      <>
        {text.substring(0, start)}
        <span className="bg-yellow-200 font-medium">{text.substring(start, end)}</span>
        {text.substring(end)}
      </>
    );
  };

  // Опція для встановлення альтернативної моделі
  const tryAlternativeModel = async () => {
    try {
      setModelLoading(true);
      setError(null);
      setDetailedError(null);
      
      // Спробуємо використати іншу версію моделі
      const tf = await import('@tensorflow/tfjs');
      await tf.setBackend('cpu'); // Спробуємо CPU як більш надійний варіант
      
      // Посилання на зменшену модель
      const modelUrl = 'https://storage.googleapis.com/tfjs-models/tfjs/qna/1/model.json';
      
      // Завантаження моделі напряму
      const qnaModule = await import('@tensorflow-models/qna');
      const loadedModel = await qnaModule.load({
        modelUrl: modelUrl
      });
      
      setModel(loadedModel);
      setContext(sampleContext);
      setError(null);
    } catch (err) {
      console.error('Помилка завантаження альтернативної моделі:', err);
      setError('Не вдалося завантажити альтернативну модель QnA');
      setDetailedError(err.toString());
    } finally {
      setModelLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Модель питань та відповідей (QnA)</h1>
      
      {modelLoading ? (
        <div className="text-center py-4">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 rounded-full border-t-transparent animate-spin mr-2"></div>
            <p>Завантаження моделі QnA...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Помилка:</p>
          <p>{error}</p>
          {detailedError && (
            <div className="mt-2">
              <details>
                <summary className="cursor-pointer text-sm">Показати технічні деталі</summary>
                <pre className="mt-2 p-2 bg-red-50 text-xs overflow-x-auto">{detailedError}</pre>
              </details>
            </div>
          )}
          <div className="mt-4">
            <button 
              onClick={tryAlternativeModel}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Спробувати альтернативну модель
            </button>
          </div>
          <div className="mt-2 text-sm">
            <p>Можливі причини помилки:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>Несумісність версій TensorFlow.js та моделі QnA</li>
              <li>Проблеми з WebGL у вашому браузері</li>
              <li>Недостатньо пам'яті для завантаження моделі</li>
              <li>Проблеми з мережею</li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-2">
              Контекст:
            </label>
            <textarea
              id="context"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="6"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Введіть контекст, в якому модель шукатиме відповіді..."
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
              Запитання:
            </label>
            <input
              id="question"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Поставте запитання щодо контексту..."
            />
            <div className="mt-2 text-sm text-gray-500">
              Приклади запитань: "Коли був випущений TensorFlow.js?", "Що таке TensorFlow.js?", "Чому TensorFlow.js корисний для приватності?"
            </div>
          </div>
          
          <button
            onClick={answerQuestion}
            disabled={loading || !question.trim() || !context.trim()}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Шукаю відповідь...' : 'Знайти відповідь'}
          </button>
          
          {answers.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-3">Знайдені відповіді:</h2>
              <div className="space-y-4">
                {answers.map((answer, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="mb-2">
                      <span className="font-semibold">Відповідь {index + 1}:</span> {answer.text}
                    </div>
                    <div className="text-sm text-gray-600">
                      Впевненість: {(answer.score * 100).toFixed(1)}%
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Контекст:</span>
                      <p className="mt-1 p-2 bg-white rounded border border-gray-200">
                        {highlightText(context, answer.startIndex, answer.endIndex)}
                      </p>
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
          <strong>Про модель:</strong> Модель QnA (Question and Answer) TensorFlow.js використовує 
          архітектуру BERT для розуміння тексту та знаходження відповідей на запитання безпосередньо 
          з контексту. Модель аналізує семантичний зміст тексту і знаходить фрагменти, які найбільш 
          релевантні до поставленого запитання.
        </p>
      </div>
    </div>
  );
};

export default QnADemo;