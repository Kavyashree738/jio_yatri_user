import logo from './logo.svg';
import './App.css';
import ScrollToTop from "./components/pages/ScrollToTop";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './components/pages/Home'
import VehicleDetails from './components/pages/VehicleDetails';
import HelpDetail from './components/pages/HelpDetail';
function App() {
  return (
    <div className="App">
       <BrowserRouter>
       <ScrollToTop />
         <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vehicle/:type" element={<VehicleDetails />} />
            <Route path="/help-details" element={<HelpDetail />} />
         </Routes>

       </BrowserRouter>
      
    </div>
  );
}

export default App;



