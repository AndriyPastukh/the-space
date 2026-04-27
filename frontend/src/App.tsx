import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import { MainPage } from "./pages/MainPage/MainPage.tsx";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import LoginPage from "./pages/LoginPage/LoginPage.tsx";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";
import CreatePage from "./pages/CreatePage/CreatePage";
import TaskDetails from "./pages/TaskDetailsPage/TaskDetailsPage.tsx"; 

import { Header } from "./components/Header/Header.tsx";
import { Footer } from "./components/Footer/Footer.tsx";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />

        {/* Тимчасова кнопка без стилів для перевірки */}
        <Link to="/test-task">ПЕРЕВІРИТИ СТОРІНКУ ЗАВДАННЯ</Link>

        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/test-task" element={<TaskDetails />} />
          <Route path="/*" element={<NotFoundPage />} />
        </Routes>
        
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;