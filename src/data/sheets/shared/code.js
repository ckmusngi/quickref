// Tag for multi-line snippets: keeps backslashes literal and trims the leading/trailing
// newline. The indentation of the closing backtick is removed from every line, so a
// snippet can be indented to match the surrounding object and still render flush-left:
//
//     code: c`
//       npm install
//       `,
//
// Note: "${" still interpolates — write $VAR instead of ${VAR} in shell code.
export const c = (strings, ...values) => {
  const raw = String.raw(strings, ...values).replace(/^\n/, '')
  const cut = (raw.match(/\n( *)$/) || ['', ''])[1].length
  return raw
    .split('\n')
    .map(line => line.slice(Math.min(cut, line.match(/^ */)[0].length)))
    .join('\n')
    .replace(/\s+$/, '')
}

// Prefix a shared section with its step number, e.g. step('6a', laravel)
export const step = (n, section, title = section.title) => ({
  ...section,
  title: `${n}. ${title}`,
})

// PowerShell line-continuation backtick (a raw ` would end the template literal)
export const BT = '`'
