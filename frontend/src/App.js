import "./App.css";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/index";
import Animation from "./pages/animation";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />}></Route>
        <Route path="/animation" element={<Animation />}></Route>
      </Routes>
    </>
  );
}

export default App;
