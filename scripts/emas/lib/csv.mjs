// Minimal CSV read/write — no embedded commas or quotes appear in any of
// this project's EMAS data files (checked), so a full RFC 4180 parser is
// not needed. Standard library only (Node's fs), no dependency.
import fs from 'node:fs'

export function readCsv(path) {
  const text = fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n').trim()
  const lines = text.split('\n')
  const header = lines[0].split(',')
  return lines.slice(1).map((line) => {
    const cells = line.split(',')
    const row = {}
    header.forEach((key, i) => {
      row[key] = cells[i] === undefined ? '' : cells[i]
    })
    return row
  })
}

export function writeCsv(path, rows, columns) {
  const lines = [columns.join(',')]
  for (const row of rows) {
    lines.push(columns.map((c) => csvCell(row[c])).join(','))
  }
  fs.writeFileSync(path, lines.join('\n') + '\n')
}

function csvCell(value) {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}
