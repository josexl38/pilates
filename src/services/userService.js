import { DB } from './database.js';

export function addSessions(email, numberOfSessions) {
  const users = DB.users();
  const user = users.find(u => u.email === email.trim().toLowerCase());
  if (!user) throw new Error("Usuario no encontrado");
  
  user.sessions = Math.max(0, (user.sessions || 0) + Number(numberOfSessions));
  DB.saveUsers(users);
}

export function setSessions(email, totalSessions) {
  const users = DB.users();
  const user = users.find(u => u.email === email.trim().toLowerCase());
  if (!user) throw new Error("Usuario no encontrado");
  
  user.sessions = Math.max(0, Number(totalSessions) || 0);
  DB.saveUsers(users);
}