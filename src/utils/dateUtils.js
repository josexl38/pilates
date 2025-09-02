export const pad = n => n.toString().padStart(2, "0");

export const localISO = d => 
  `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

export const parseLocalISO = iso => {
  const [dp, tp] = iso.split("T");
  const [y, m, dd] = dp.split("-").map(Number);
  const [hh, mm] = tp.split(":").map(Number);
  return new Date(y, m-1, dd, hh, mm);
};

export const addDays = (baseDate, numDays) => {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + numDays);
  return date;
};

export const formatDateTime = date => 
  date.toLocaleString('es-ES', {
    weekday: "short", 
    year: "numeric", 
    month: "short", 
    day: "numeric", 
    hour: "2-digit", 
    minute: "2-digit"
  });

export const dayKey = date => date.toISOString().slice(0, 10);

export const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);