// RUTA: client/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Importa componentes de react-router
import HomePage from "./pages/HomePage";
import GameDetailPage from "./pages/GameDetailPage"; // Importa la nueva página
import Header from "./components/Header"; // Asumiendo que tienes un Header
import { ThemeProvider } from "./context/ThemeContext"; // Asumiendo que tienes ThemeContext

export const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
          <Header />
          <main className="pb-10">
            {" "}
            {/* Añade padding inferior si es necesario */}
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/game/:gameId" element={<GameDetailPage />} />
              {/* Ruta Catch-all para 404 (opcional) */}
              {/* <Route path="*" element={<NotFoundPage />} /> */}
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
};
