import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import { MainPage } from "./pages/MainPage";
import { Page1 } from "./pages/Page1";
import { Page2 } from "./pages/Page2";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/page1" element={<Page1 />} />
          <Route path="/page2" element={<Page2 />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
