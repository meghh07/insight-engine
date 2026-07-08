const ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

export function htmlEscape(input) {
  return String(input).replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}
