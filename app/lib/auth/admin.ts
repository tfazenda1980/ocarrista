export function adminUsername(): string {
  return process.env.ADMIN_USERNAME?.trim() || "Admin1762";
}

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD?.trim() || "Leopard2@6";
}

export function checkAdminCredentials(username: string, password: string): boolean {
  return (
    username.trim().toLowerCase() === adminUsername().toLowerCase() &&
    password === adminPassword()
  );
}
