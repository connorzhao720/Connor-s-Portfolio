const publicBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const sitePath = (pathname: string) => `${publicBasePath}${pathname}`;
