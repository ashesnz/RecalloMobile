/**
 * Get a time-based greeting message
 * @returns Greeting string based on current time
 */
export const getGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good morning';
  } else if (hour < 18) {
    return 'Good afternoon';
  } else {
    return 'Good evening';
  }
};

/**
 * Get a personalized greeting with user's name
 * @param name - User's name
 * @returns Personalized greeting string
 */
export const getPersonalizedGreeting = (name?: string | null): string => {
  const greeting = getGreeting();

  if (!name) {
    return greeting;
  }

  return `${greeting}, ${name}`;
};

