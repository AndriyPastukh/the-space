import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Імпортуємо ваші сторінки
import { MainPage } from "./pages/MainPage/MainPage.tsx";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import LoginPage from "./pages/LoginPage/LoginPage.tsx";
import { Header } from "./components/Header/Header.tsx";
import { Footer } from "./components/Footer/Footer.tsx"

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;