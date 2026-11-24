import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { brotliCompress, constants, gzip } from 'node:zlib'

// zlib's callback API runs on the libuv threadpool, so files compress in parallel.
const brotliAsync = promisify(brotliCompress)
const gzipAsync = promisify(gzip)

/** Text-like build output; images, fonts and models are compressed already. */
const COMPRESSIBLE = /\.(?:css|cjs|html|js|json|map|mjs|svg|txt|wasm|webmanifest|xml)$/i
/** Smaller files gain too little to be worth a sibling. */
const MIN_BYTES = 1024
/**
 * Brotli 11 takes about 2 s per MB, so larger files use quality 5: on the
 * 14.8 MB ONNX Runtime wasm, 11 took 30 s for 2.45 MB and 5 took 0.5 s for
 * 2.94 MB, against 3.83 MB from gzip 9.
 */
const BROTLI_11_MAX_BYTES = 4 * 1024 * 1024

export interface PrecompressedFile {
  /** Relative to the compressed directory. */
  file: string
  bytes: number
  brotliBytes?: number
  gzipBytes?: number
}

async function compress(directory: string, file: string, content: Buffer): Promise<PrecompressedFile> {
  const [brotli, gzipped] = await Promise.all([
    brotliAsync(content, {
      params: {
        [constants.BROTLI_PARAM_QUALITY]: content.length > BROTLI_11_MAX_BYTES ? 5 : 11,
        [constants.BROTLI_PARAM_SIZE_HINT]: content.length,
      },
    }),
    gzipAsync(content, { level: 9 }),
  ])
  const result: PrecompressedFile = { file: path.relative(directory, file), bytes: content.length }
  // A sibling that is not smaller would only cost the client a decode.
  if (brotli.length < content.length) {
    await writeFile(`${file}.br`, brotli)
    result.brotliBytes = brotli.length
  }
  if (gzipped.length < content.length) {
    await writeFile(`${file}.gz`, gzipped)
    result.gzipBytes = gzipped.length
  }
  return result
}

/**
 * Writes `.br` (brotli) and `.gz` (gzip 9) siblings beside each compressible
 * file of at least 1 KiB in a freshly built directory, for the server to send
 * to clients that accept them.
 */
export async function precompressDirectory(directory: string): Promise<PrecompressedFile[]> {
  const files = (await readdir(directory, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile() && COMPRESSIBLE.test(entry.name))
    .map((entry) => path.join(entry.parentPath, entry.name))
  const candidates = (await Promise.all(files.map(async (file) => ({ file, content: await readFile(file) }))))
    .filter(({ content }) => content.length >= MIN_BYTES)
    // Queued largest first, so the slowest file does not start last.
    .sort((left, right) => right.content.length - left.content.length)
  return Promise.all(candidates.map(({ file, content }) => compress(directory, file, content)))
}
