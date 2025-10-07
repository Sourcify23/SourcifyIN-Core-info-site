import { Route, Routes } from "react-router-dom";
import SearchAndFilter from "./components/SearchAndFilter";
import SourcifyContentGenerator from "./components/SourcifyContentGenerator";

function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <SearchAndFilter />
    </div>} />
    <Route path="/content" element={<SourcifyContentGenerator/>}></Route>
    </Routes>
    
  );
}

export default App;
