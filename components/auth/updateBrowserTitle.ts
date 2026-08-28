export function updateBrowserTitle(
  title: string,
  resetAfter = true,
  delay = 3000,
) {
  if (typeof document === "undefined") {
    return;
  }

  const defaultTitle =
    "เข้าสู่ระบบ | GreenFactory Insight";

  document.title = title;

  if (!resetAfter) {
    return;
  }

  window.setTimeout(() => {
    document.title = defaultTitle;
  }, delay);
}