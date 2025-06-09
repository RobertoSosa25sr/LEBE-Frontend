export const ROLES = {
  ADMINISTRATOR: 'Administrator',
  USER: 'User',
  CLIENT: 'Client'
} as const;

export const ROLE_OPTIONS = Object.values(ROLES); 