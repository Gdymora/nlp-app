import React, { useState } from 'react';

// Спрощена версія NLPToolkit для вирішення проблеми завантаження
const NLPToolkit = () => {
  const [activeTab, setActiveTab] = useState('intro');
  
  // Компоненти вкладок
  const tabs = [
    { id: 'intro', name: 'Вступ' },
    { id: 'models', name: 'Доступні моделі' },
    { id: 'integration', name: 'Інтеграція' },
    { id: 'examples', name: 'Приклади' }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Інструментарій обробки природної мови на TensorFlow.js</h1>
      
      {/* Навігаційні вкладки */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-4 font-medium text-sm mr-2 ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Вміст вкладок */}
      <div className="mt-4">
        {activeTab === 'intro' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Обробка природної мови в браузері з TensorFlow.js</h2>
            <p className="mb-4">
              TensorFlow.js надає потужні можливості для обробки природної мови (NLP) безпосередньо 
              в браузері, без необхідності серверної обробки. Це дозволяє створювати інтелектуальні 
              веб-застосунки, які можуть аналізувати текст, відповідати на запитання, класифікувати 
              контент та багато іншого.
            </p>
            <p className="mb-4">
              Моделі NLP в TensorFlow.js працюють безпосередньо на пристрої користувача, що забезпечує:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Конфіденційність даних — текст користувача не відправляється на сервер</li>
              <li>Офлайн-функціональність — моделі працюють навіть без інтернет-з'єднання</li>
              <li>Низьку затримку — немає потреби чекати на відповідь сервера</li>
              <li>Зменшення навантаження на сервери — обчислення відбуваються на клієнтській стороні</li>
            </ul>
          </div>
        )}
        
        {activeTab === 'models' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Доступні NLP моделі в TensorFlow.js</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-medium mb-2 text-gray-800">Universal Sentence Encoder</h3>
                <p className="text-gray-600 mb-3">
                  Кодує речення в багатовимірні вектори, що дозволяє порівнювати семантичну подібність текстів.
                </p>
                <div className="text-sm text-gray-500">
                  Розмір моделі: ~25 МБ
                </div>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-medium mb-2 text-gray-800">Text Toxicity</h3>
                <p className="text-gray-600 mb-3">
                  Виявляє різні типи токсичного вмісту в тексті за допомогою глибокого навчання.
                </p>
                <div className="text-sm text-gray-500">
                  Розмір моделі: ~30 МБ
                </div>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-medium mb-2 text-gray-800">Question and Answer</h3>
                <p className="text-gray-600 mb-3">
                  Знаходить відповіді на запитання на основі заданого контексту.
                </p>
                <div className="text-sm text-gray-500">
                  Розмір моделі: ~40 МБ
                </div>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-medium mb-2 text-gray-800">BERT</h3>
                <p className="text-gray-600 mb-3">
                  Двонаправлена модель для розуміння контексту тексту з використанням трансформерів.
                </p>
                <div className="text-sm text-gray-500">
                  Розмір моделі: ~400 МБ (повна), ~50 МБ (легка)
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'integration' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Інтеграція NLP моделей у ваш проект</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3">Кроки для інтеграції</h3>
              
              <ol className="list-decimal pl-6 space-y-4">
                <li>
                  <h4 className="font-medium text-gray-800">Встановлення необхідних пакетів</h4>
                  <p className="text-gray-600 mt-1">Використайте npm або yarn для встановлення TensorFlow.js та потрібних моделей.</p>
                </li>
                
                <li>
                  <h4 className="font-medium text-gray-800">Імпорт моделей</h4>
                  <p className="text-gray-600 mt-1">Імпортуйте TensorFlow.js та потрібну модель у вашому коді.</p>
                </li>
                
                <li>
                  <h4 className="font-medium text-gray-800">Завантаження моделі</h4>
                  <p className="text-gray-600 mt-1">Асинхронно завантажте модель, показуючи користувачу індикатор прогресу.</p>
                </li>
                
                <li>
                  <h4 className="font-medium text-gray-800">Використання моделі</h4>
                  <p className="text-gray-600 mt-1">Викликайте методи моделі для обробки введеного користувачем тексту.</p>
                </li>
              </ol>
            </div>
          </div>
        )}
        
        {activeTab === 'examples' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Приклади використання</h2>
            
            <div className="space-y-6">
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-medium mb-3 text-gray-800">Розумний чат-бот із QnA</h3>
                <p className="text-gray-600 mb-3">
                  Створіть чат-бота, який може відповідати на запитання на основі бази знань.
                </p>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-medium mb-3 text-gray-800">Пошук семантично подібних документів</h3>
                <p className="text-gray-600 mb-3">
                  Реалізуйте пошукову систему, яка знаходить документи за семантичною подібністю.
                </p>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-medium mb-3 text-gray-800">Фільтр токсичних коментарів</h3>
                <p className="text-gray-600 mb-3">
                  Додайте автоматичну модерацію в коментарі вашого сайту або додатку.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NLPToolkit;