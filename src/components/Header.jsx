// src/components/Header.jsx
import React from "react";
import { useTheme } from "../context/ThemeContext";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline"; // Necesitarás instalar @heroicons/react

function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md py-3 px-4 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        {/* Espaciador izquierdo para centrar el título */}
        <div className="w-10"></div>

        {/* Título Centrado */}
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white text-center flex-grow">
          Kronz
        </h1>

        {/* Botón de Tema */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-teal-500"
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <MoonIcon className="h-6 w-6" />
          ) : (
            <SunIcon className="h-6 w-6" />
          )}
        </button>
      </div>
    </header>
  );
}

export default Header;

// Nota: Necesitas instalar @heroicons/react
// npm install @heroicons/react
