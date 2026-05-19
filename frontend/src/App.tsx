import "./assets/styles/App.css";
import { HashRouter, Routes, Route } from "react-router-dom";
import { MainPage } from "./pages/MainPage/MainPage.tsx";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import LoginPage from "./pages/LoginPage/LoginPage.tsx";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";
import CreateExperiencePage from "./pages/CreatePage/CreateExperiencePage.tsx";
import TaskDetails from "./pages/TaskDetailsPage/TaskDetailsPage.tsx";
import KnowledgeDetails from "./pages/KnowledgeDetailsPage/KnowledgeDetailsPage.tsx";
import TeamDetailsPage from "./pages/TeamDetailsPage/TeamDetailsPage.tsx";
import CommunityDetailsPage from "./pages/CommunityDetailsPage/CommunityDetailsPage.tsx";
import { Header } from "./components/Header/Header.tsx";
import { Footer } from "./components/Footer/Footer.tsx";
import TermsPage from "./pages/TermsPage/TermsPage.tsx";
import SearchPage from "./pages/SearchPage/SearchPage.tsx";
import MyProfilePage from "./pages/MyProfilePage/MyProfilePage";
import CreateSpacePage from "./pages/CreateSpacePage/CreateSpacePage";
import MyCreatedExperiencesPage from "./pages/MyCreatedExperiencesPage/MyCreatedExperiencesPage";
import SearchSpacePage from "./pages/SearchSpacePage/SearchSpacePage";
import MyChatsPage from "./pages/MyChatsPage/MyChatsPage";
import PublicProfilePage from "./pages/PublicProfilePage/PublicProfilePage";
import EditTaskPage from "./pages/EditPage/EditTaskPage.tsx";
import EditKnowledgePage from "./pages/EditPage/EditKnowledgePage.tsx";

function App() {
    return (
        <HashRouter>
            <div className="App">
                <Header />
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/create-experience" element={<CreateExperiencePage />} />
                    <Route path="/tasks/:id" element={<TaskDetails />} />
                    <Route path="/tasks/:id/edit" element={<EditTaskPage />} />
                    <Route path="/knowledges/:id" element={<KnowledgeDetails />} />
                    <Route path="/knowledges/:id/edit" element={<EditKnowledgePage />} />
                    <Route path="/teams/:id" element={<TeamDetailsPage />} />
                    <Route path="/communities/:id" element={<CommunityDetailsPage />} />
                    <Route path="/search-experience" element={<SearchPage />} />
                    <Route path="/profile" element={<MyProfilePage />} />
                    <Route path="/users/:id" element={<PublicProfilePage />} />
                    <Route path="/create-space" element={<CreateSpacePage />} />
                    <Route path="/my-experiences" element={<MyCreatedExperiencesPage />} />
                    <Route path="/search-space" element={<SearchSpacePage />} />
                    <Route path="/chats" element={<MyChatsPage />} />
                    <Route path="/*" element={<NotFoundPage />} />
                </Routes>
                <Footer />
            </div>
        </HashRouter>
    );
}

export default App;