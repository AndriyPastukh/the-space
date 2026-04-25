import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Імпортуємо ваші сторінки
import { MainPage } from "./pages/MainPage/MainPage.tsx";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import LoginPage from "./pages/LoginPage/LoginPage.tsx";

import { useAuth } from "./hooks/useAuth.tsx";

import { Header } from "./components/Header/Header.tsx";
import { Footer } from "./components/Footer/Footer.tsx";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";

function App() {
  const { isAuth, user, logout } = useAuth();

  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        {/* це перенести в header цю логіку і звідси винести App має бути чистий */}
        {isAuth && (
          <div>
            <button onClick={() => logout()}>LOGOUT</button>
            <div>{isAuth && <>{user.email}</>}</div>
          </div>
        )}

        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
