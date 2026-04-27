import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { MainPage } from "./pages/MainPage/MainPage.tsx";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import LoginPage from "./pages/LoginPage/LoginPage.tsx";
import TermsPage from "./pages/TermsPage/TermsPage"; 
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";
import CreatePage from "./pages/CreatePage/CreatePage";

import { Header } from "./components/Header/Header.tsx";
import { Footer } from "./components/Footer/Footer.tsx";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />

        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/terms" element={<TermsPage />} />
          
          <Route path="/create" element={<CreatePage />} />
          <Route path="/*" element={<NotFoundPage />} />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;