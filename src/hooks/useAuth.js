import { useState, useEffect } from 'react';
import { DB } from '../services/database.js';

export function useAuth() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const storedUser = DB.current();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  function login(email, password = "") {
    const cleanEmail = email.trim().toLowerCase();
    
    // Basic email validation
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
      throw new Error("Correo inválido");
    }
    
    const users = DB.users();
    const foundUser = users.find(u => u.email === cleanEmail);
    if (!foundUser) {
      throw new Error("Usuario no encontrado");
    }
    
    DB.setCurrent(foundUser);
    setUser(foundUser);
  }

  function logout() {
    DB.setCurrent(null);
    setUser(null);
  }

  function reload() {
    const currentUser = DB.current();
    setUser(currentUser);
  }

  return { user, login, logout, reload };
}