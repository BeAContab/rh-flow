export const appRoles = ["admin", "super_user", "user"] as const;

export type AppRole = (typeof appRoles)[number];

export function getRoleLabel(role: AppRole) {
  switch (role) {
    case "admin":
      return "ADMIN";
    case "super_user":
      return "SUPER USER";
    default:
      return "USER";
  }
}

export function canAccessUserManagement(role: AppRole) {
  return role === "admin" || role === "super_user";
}

export function getCreatableRoles(role: AppRole): AppRole[] {
  if (role === "admin") {
    return ["user", "super_user", "admin"];
  }

  if (role === "super_user") {
    return ["user"];
  }

  return [];
}

export function canCreateRole(actorRole: AppRole, targetRole: AppRole) {
  return getCreatableRoles(actorRole).includes(targetRole);
}

// Deletion follows stricter rules than creation to protect privileged accounts.
export function canDeleteRole(actorRole: AppRole, targetRole: AppRole) {
  if (actorRole === "admin") {
    return targetRole === "super_user" || targetRole === "user";
  }

  if (actorRole === "super_user") {
    return targetRole === "user";
  }

  return false;
}
