import { TEST_USERS } from '../config/constants.js';

export const DB = {
  users() {
    const stored = JSON.parse(localStorage.getItem("pb_users") || "[]");
    if (stored.length === 0) {
      this.saveUsers(TEST_USERS);
      return TEST_USERS;
    }
    return stored;
  },

  saveUsers(users) {
    localStorage.setItem("pb_users", JSON.stringify(users));
  },

  bookings() {
    return JSON.parse(localStorage.getItem("pb_bookings") || "[]");
  },

  saveBookings(bookings) {
    localStorage.setItem("pb_bookings", JSON.stringify(bookings));
  },

  setCurrent(user) {
    localStorage.setItem("pb_current_user", JSON.stringify(user));
  },

  current() {
    return JSON.parse(localStorage.getItem("pb_current_user") || "null");
  }
};