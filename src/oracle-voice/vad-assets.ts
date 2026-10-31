import vadModelUrl from '@ricky0123/vad-web/dist/silero_vad_v5.onnx?url'
import vadWorkletUrl from '@ricky0123/vad-web/dist/vad.worklet.bundle.min.js?url'
import onnxModuleUrl from 'onnxruntime-web/ort-wasm-simd-threaded.mjs?url'
import onnxWasmUrl from 'onnxruntime-web/ort-wasm-simd-threaded.wasm?url'

const VAD_MODEL_FILE = 'silero_vad_v5.onnx'
const VAD_WORKLET_FILE = 'vad.worklet.bundle.min.js'
const ONNX_MODULE_FILE = 'ort-wasm-simd-threaded.mjs'
const ONNX_WASM_FILE = 'ort-wasm-simd-threaded.wasm'

export const ORACLE_VOICE_VAD_ASSETS = Object.freeze({
  modelUrl: localAssetUrl(vadModelUrl, VAD_MODEL_FILE),
  workletUrl: localAssetUrl(vadWorkletUrl, VAD_WORKLET_FILE),
  onnxModuleUrl: localAssetUrl(onnxModuleUrl, ONNX_MODULE_FILE),
  onnxWasmUrl: localAssetUrl(onnxWasmUrl, ONNX_WASM_FILE),
})

export const ORACLE_VOICE_VAD_BASE_PATH = sharedAssetDirectory(
  ORACLE_VOICE_VAD_ASSETS.modelUrl,
  ORACLE_VOICE_VAD_ASSETS.workletUrl,
)

export const ORACLE_VOICE_ONNX_WASM_BASE_PATH = sharedAssetDirectory(
  ORACLE_VOICE_VAD_ASSETS.onnxModuleUrl,
  ORACLE_VOICE_VAD_ASSETS.onnxWasmUrl,
)

function localAssetUrl(assetUrl: string, expectedFile: string): string {
  const resolved = new URL(assetUrl, browserBaseUrl())
  if (resolved.origin !== browserBaseUrl().origin) {
    throw new Error(`Oracle voice asset ${expectedFile} must be same-origin`)
  }
  if (resolved.pathname.split('/').at(-1) !== expectedFile) {
    throw new Error(`Oracle voice asset must retain the local filename ${expectedFile}`)
  }
  return `${resolved.pathname}${resolved.search}${resolved.hash}`
}

function sharedAssetDirectory(first: string, second: string): string {
  const firstDirectory = directory(first)
  const secondDirectory = directory(second)
  if (firstDirectory !== secondDirectory) {
    throw new Error('Oracle voice assets that share a runtime base path must be colocated')
  }
  return firstDirectory
}

function directory(assetUrl: string): string {
  return assetUrl.slice(0, assetUrl.lastIndexOf('/') + 1)
}

function browserBaseUrl(): URL {
  return new URL(globalThis.location?.href ?? 'http://localhost/')
}
