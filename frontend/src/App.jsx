import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Poems from "./pages/Poems";
import Login from "./pages/Login";

export default function App() {
return (
<BrowserRouter>
<Navbar />
<Routes>
<Route path="/" element={<Home />} />
<Route path="/poems" element={<Poems />} />
<Route path="/login" element={<Login />} />
</Routes>
</BrowserRouter>
);
}