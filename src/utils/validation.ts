export const emailRegex =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Пожалуйста, введите почту';
  if (!emailRegex.test(email)) return 'Неверный формат почты';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password.trim()) return 'Пожалуйста, введите пароль';
  return null;
}

export function validateProductName(name: string): string | null {
  if (!name.trim()) return 'Введите наименование товара';
  return null;
}

export function validatePrice(price: number): string | null {
  if (price <= 0) return 'Цена должна быть больше 0';
  return null;
}

export function validateVendor(vendor: string): string | null {
  if (!vendor.trim()) return 'Введите вендора';
  return null;
}

export function validateSKU(sku: string): string | null {
  if (!sku.trim()) return 'Введите артикул';
  return null;
}