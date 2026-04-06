import { Link } from "react-router-dom";

export const Page2 = () => {
  return (
    <>
      <div>
        Це є контейнер для ДРУГОЇ сторінки і показу правильності переходів
      </div>
      <Link to={"/"} className="my-button-style">
        До головної
      </Link>
    </>
  );
};
