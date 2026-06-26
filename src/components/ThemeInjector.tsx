'use client';

export default function ThemeInjector({ primaryColor }: { primaryColor: string }) {
  if (typeof window !== 'undefined') {
    document.documentElement.style.setProperty('--primary', primaryColor, 'important');
    document.documentElement.style.setProperty('--sidebar-primary', primaryColor, 'important');
    document.documentElement.style.setProperty('--ring', primaryColor, 'important');
    document.documentElement.style.setProperty('--sidebar-ring', primaryColor, 'important');
  }
  return null;
}
