import "./App.css";

import { Routes, Route } from "react-router-dom";
import Stream from "./pages/Stream";
import Layout from "./components/Layout/Layout";
import Profile from "./pages/Profile";

function App() {

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Stream />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Layout>
  );
}

export default App;
