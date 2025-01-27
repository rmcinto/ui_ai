import "./App.scss";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import FrameSelection from './pages/FrameSelection'
import Annotation from './pages/Annotation'
import AppNavBar from "./components/app/NavBar";

function App() {

    return (
        <Router>
            <AppNavBar />
            <Routes>
                <Route path="/" element={<FrameSelection />} />
                <Route path="/annotation" element={<Annotation />} />
            </Routes>
        </Router>
    );
}
export default App;