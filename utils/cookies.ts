
import Cookies from 'js-cookie';

export const getCookie = (name: string): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  try {
    return Cookies.get(name);
  } catch (error) {
    console.error('Error reading cookie:', error);
    return undefined;
  }
};

export const setCookie = (name: string, value: string, days: number = 7): void => {
  if (typeof window === 'undefined') return;
  try {
    const isSecure = window.location.protocol === 'https:';
    Cookies.set(name, value, {
      expires: days,
      path: '/',
      sameSite: 'Lax',
      secure: isSecure,
    });
  } catch (error) {
    console.error('Error setting cookie:', error);
  }
};

export const deleteCookie = (name: string): void => {
  if (typeof window === 'undefined') return;
  try {
    Cookies.remove(name, { path: '/' });
    Cookies.remove(name, { path: '/', domain: window.location.hostname });
  } catch (error) {
    console.error('Error deleting cookie:', error);
  }
};

