import React, { createContext, useContext, useState, useEffect } from "react";

// 1. Създаваме контекст
const TokenContext = createContext();

// 2. Създаваме Provider
export function TokenProvider({ children }) {
  const [token, setTokenState] = useState(null);

  // 3. Зареждаме token от localStorage при стартиране
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setTokenState(savedToken);
    }
  }, []);

  // 4. Функция за сетване (и localStorage)
  const setToken = (newToken) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
    }
    setTokenState(newToken);
  };

  return (
    <TokenContext.Provider value={{ token, setToken }}>
      {children}
    </TokenContext.Provider>
  );
}

// 5. Hook за използване на токена
export function useToken() {
  return useContext(TokenContext);
}
