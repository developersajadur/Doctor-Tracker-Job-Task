export const USER_ROLE = {
  admin: 'admin',
  staff: 'staff',
} as const;

export type TUserRole = keyof typeof USER_ROLE;
