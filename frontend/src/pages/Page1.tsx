import { Link } from "react-router-dom";

export function Page1() {
  return (
    <>
      <div>
        Це є контейнер для ПЕРШОЇ сторінки і показу правильності переходів
      </div>
      <Link to={"/"} className="my-button-style">
        До головної
      </Link>
    </>
  );
}
