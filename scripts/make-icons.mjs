import { deflateSync } from "node:zlib"
import { writeFileSync } from "node:fs"

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return ~c >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const name = Buffer.from(type)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])))
  return Buffer.concat([len, name, data, crc])
}

function insideRoundRect(nx, ny) {
  const left = 0.08
  const right = 0.92
  const rad = 0.18
  if (nx < left || nx > right || ny < left || ny > right) return false
  const cx = Math.min(Math.max(nx, left + rad), right - rad)
  const cy = Math.min(Math.max(ny, left + rad), right - rad)
  const dx = nx - cx
  const dy = ny - cy
  return dx * dx + dy * dy <= rad * rad
}

function inDoor(nx, ny) {
  const left = 0.36
  const right = 0.64
  const top = 0.28
  const bot = 0.76
  const rad = (right - left) / 2
  const cy = top + rad
  const cx = 0.5
  if (ny >= cy && ny <= bot && nx >= left && nx <= right) return true
  const dx = nx - cx
  const dy = ny - cy
  return ny < cy && ny >= top && dx * dx + dy * dy <= rad * rad
}

function png(size) {
  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y++) {
    const row = y * (size * 4 + 1)
    raw[row] = 0
    for (let x = 0; x < size; x++) {
      const nx = (x + 0.5) / size
      const ny = (y + 0.5) / size
      const i = row + 1 + x * 4
      if (!insideRoundRect(nx, ny)) {
        raw[i + 3] = 0
        continue
      }
      const door = inDoor(nx, ny)
      raw[i] = door ? 246 : 154
      raw[i + 1] = door ? 240 : 59
      raw[i + 2] = door ? 230 : 43
      raw[i + 3] = 255
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ])
}

writeFileSync(new URL("../public/icon-192.png", import.meta.url), png(192))
writeFileSync(new URL("../public/icon-512.png", import.meta.url), png(512))
