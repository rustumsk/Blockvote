import fs from 'fs'
import path from 'path'

export type VoterRollEntry = {
  fullName: string
  idNumber: string
  email: string
  organization: string
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

export function normalizeIdNumber(value: string) {
  return value.trim().replace(/\s+/g, '')
}

function parseCsvLine(line: string): string[] {
  const out: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      inQuotes = !inQuotes
      continue
    }
    if (!inQuotes && c === ',') {
      out.push(current)
      current = ''
      continue
    }
    current += c
  }
  out.push(current)
  return out.map((cell) => cell.trim())
}

function mapHeader(cells: string[]): Record<string, number> {
  const map: Record<string, number> = {}
  cells.forEach((raw, index) => {
    const key = raw.trim().toLowerCase()
    map[key] = index
  })
  return map
}

function pickColumn(
  cells: string[],
  headerMap: Record<string, number>,
  ...aliases: string[]
): string {
  for (const alias of aliases) {
    const idx = headerMap[alias.toLowerCase()]
    if (idx !== undefined && cells[idx] !== undefined) return cells[idx]!
  }
  return ''
}

export function parseVoterRollCsv(content: string): VoterRollEntry[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length < 2) return []

  const headerCells = parseCsvLine(lines[0]!)
  const headerMap = mapHeader(headerCells)

  const entries: VoterRollEntry[] = []
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]!)
    const fullName = pickColumn(cells, headerMap, 'full name', 'fullname', 'name')
    const idNumber = pickColumn(cells, headerMap, 'id number', 'idnumber', 'id')
    const email = pickColumn(cells, headerMap, 'email', 'e-mail')
    const organization = pickColumn(cells, headerMap, 'organization', 'org')
    if (!email || !idNumber) continue
    entries.push({ fullName, idNumber, email, organization })
  }
  return entries
}

let cached: { path: string; mtimeMs: number; entries: VoterRollEntry[] } | null = null

export function getVoterRollPath(): string {
  const fromEnv = process.env.VOTER_ROLL_CSV_PATH?.trim()
  if (fromEnv) return path.resolve(fromEnv)
  return path.join(process.cwd(), 'data', 'voter-roll.csv')
}

export function loadVoterRoll(): VoterRollEntry[] {
  const filePath = getVoterRollPath()
  let stat: fs.Stats
  try {
    stat = fs.statSync(filePath)
  } catch {
    return []
  }

  if (cached && cached.path === filePath && cached.mtimeMs === stat.mtimeMs) {
    return cached.entries
  }

  const content = fs.readFileSync(filePath, 'utf8')
  const entries = parseVoterRollCsv(content)
  cached = { path: filePath, mtimeMs: stat.mtimeMs, entries }
  return entries
}

export function isEmailAndIdOnVoterRoll(email: string, idNumber: string): boolean {
  const e = normalizeEmail(email)
  const id = normalizeIdNumber(idNumber)
  if (!e || !id) return false

  for (const row of loadVoterRoll()) {
    if (normalizeEmail(row.email) === e && normalizeIdNumber(row.idNumber) === id) {
      return true
    }
  }
  return false
}
