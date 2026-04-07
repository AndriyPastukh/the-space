import { useState } from "react";
import { Link } from "react-router-dom";

export function MainPage() {
  const [count, setCount] = useState(0);

  const addCount = (n: number) => {
    setCount((prev) => prev + n);
  };

  return (
    <>
      <div className="my-count-style">{count}</div>
      <button className="my-button-style" onClick={() => addCount(1)}>
        Add
      </button>

      <Link to={"/page1"} className="my-button-style">
        Перша сторінка
      </Link>

      <Link to={"/page2"} className="my-button-style">
        Друга сторінка
      </Link>
    </>
  );
}
