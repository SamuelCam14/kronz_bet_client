// src/context/ThemeContext.jsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
} from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // 1. Estado del tema, intenta leer de localStorage o usa 'light' por defecto
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem("theme");
    // Podrías añadir lógica para detectar preferencia del sistema aquí
    return storedTheme || "light";
  });

  // 2. Efecto para aplicar/quitar la clase 'dark' y guardar en localStorage
  useEffect(() => {
    const root = window.document.documentElement; // Elemento <html>
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme); // Guarda la preferencia
  }, [theme]);

  // 3. Función para cambiar el tema
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // 4. Memoriza el valor del contexto para evitar re-renders innecesarios
  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// 5. Hook personalizado para usar el contexto fácilmente
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
