export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPassword = (password) => password.length >= 6;

export const isNotEmpty = (value) => value && value.trim() !== "";
