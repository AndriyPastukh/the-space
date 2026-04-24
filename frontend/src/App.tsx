import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Імпортуємо ваші сторінки
import { MainPage } from "./pages/MainPage/MainPage.tsx";
import { Page1 } from "./pages/Page1";
import { Page2 } from "./pages/Page2";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import LoginPage from "./pages/LoginPage/LoginPage.tsx";
import { Header } from "./components/Header/Header.tsx";
import {Footer} from "./components/Footer/Footer.tsx"

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header/>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/page1" element={<Page1 />} />
          <Route path="/page2" element={<Page2 />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
        <Footer/>
      </div>
    </BrowserRouter>
  );
}

export default App;