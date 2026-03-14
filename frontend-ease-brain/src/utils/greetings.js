// Time-based greeting utility
export const getTimeBasedGreeting = (username = "Administrator") => {
  const currentHour = new Date().getHours();

  if (currentHour >= 5 && currentHour < 12) {
    return `Good morning, ${username}! 🌅`;
  } else if (currentHour >= 12 && currentHour < 17) {
    return `Good afternoon, ${username}! ☀️`;
  } else if (currentHour >= 17 && currentHour < 22) {
    return `Good evening, ${username}! 🌙`;
  } else {
    return `Good night, ${username}! 🌟`;
  }
};
