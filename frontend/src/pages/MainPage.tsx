import { useState } from "react";
import { Link } from "react-router-dom";

export function MainPage() {
  const [count, setCount] = useState(0);

  const addCount = (n: number) => {
    setCount((prev) => prev + n);
  };

  return (
    <div className="main-container">
      <div className="my-count-style">{count}</div>
      
      <div className="button-group" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button className="my-button-style" onClick={() => addCount(1)}>
          Додати
        </button>

        <Link to="/page1" className="my-button-style">
          Перша сторінка
        </Link>

        <Link to="/page2" className="my-button-style">
          Друга сторінка
        </Link>

        {/* Нове посилання на реєстрацію */}
        <Link 
          to="/register" 
          className="my-button-style" 
          style={{ backgroundColor: '#4285F4', color: 'white' }}
        >
          Зареєструватись
        </Link>
      </div>
    </div>
  );
}