import { TIMES, DAYS_AHEAD } from '../config/constants.js';
import { addDays, localISO } from '../utils/dateUtils.js';

export function generateSlots() {
  const result = [];
  const now = new Date();
  
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const baseDate = addDays(now, i);
    
    for (const time of TIMES) {
      const [hours, minutes] = time.split(":").map(Number);
      const slotDate = new Date(
        baseDate.getFullYear(), 
        baseDate.getMonth(), 
        baseDate.getDate(), 
        hours, 
        minutes
      );
      
      if (slotDate < now) continue;
      result.push(localISO(slotDate));
    }
  }
  
  return result;
}