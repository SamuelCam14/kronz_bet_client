// RUTA: client/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import GameDetailPage from "./pages/GameDetailPage";

export const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        {/* Sin Header, Sin Toggle Button */}
        <main className="pb-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/game/:gameId" element={<GameDetailPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};
