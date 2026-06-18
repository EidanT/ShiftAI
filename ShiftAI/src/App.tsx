import { BrowserRouter, Routes, Route } from "react-router-dom";

import HiringModule from "./modules/hiring/HiringModule";
import RegisterVacancy from "./modules/hiring/RegisterVacancy";

import './App.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HiringModule />} />
                <Route path="/register-vacancy" element={<RegisterVacancy />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
