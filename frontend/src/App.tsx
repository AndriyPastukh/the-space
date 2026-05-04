import "./assets/styles/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainPage } from "./pages/MainPage/MainPage.tsx";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import LoginPage from "./pages/LoginPage/LoginPage.tsx";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";
import CreatePage from "./pages/CreatePage/CreatePage";
import TaskDetails from "./pages/TaskDetailsPage/TaskDetailsPage.tsx";
import KnowledgeDetails from "./pages/KnowledgeDetailsPage/KnowledgeDetailsPage.tsx";
import { Header } from "./components/Header/Header.tsx";
import { Footer } from "./components/Footer/Footer.tsx";
import TermsPage from "./pages/TermsPage/TermsPage.tsx";
import SearchPage from "./pages/SearchPage/SearchPage.tsx";
import MyProfilePage from "./pages/MyProfilePage/MyProfilePage";


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
          <Route path="/create-experience" element={<CreatePage />} />
          <Route path="/tasks/:id" element={<TaskDetails />} />
          <Route path="/knowledges/:id" element={<KnowledgeDetails />} />
          <Route path="/*" element={<NotFoundPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/profile" element={<MyProfilePage />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
