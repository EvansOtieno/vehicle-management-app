export type UserRole = 'CAR_OWNER' | 'ADMIN' | 'MECHANIC' | 'PART_DEALER';

export interface User {
  id?: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}