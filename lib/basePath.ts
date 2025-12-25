export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const withBasePath = (path: string) => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (!BASE_PATH) return normalized;
  if (normalized === BASE_PATH || normalized.startsWith(`${BASE_PATH}/`)) {
    return normalized;
  }
  return `${BASE_PATH}${normalized}`;
};
