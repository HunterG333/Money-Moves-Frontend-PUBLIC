
export function getCookie(name: string): string | null {
  const cookies = document.cookie.split(";").map(c => c.trim());
  const cookie = cookies.find((c) => c.startsWith(name + "="));
  return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
}




