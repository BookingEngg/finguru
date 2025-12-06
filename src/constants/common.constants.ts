export const Roles = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  USER: "user",
};

export type RoleType = (typeof Roles)[keyof typeof Roles];

