// Runs on the audio rendering thread. Posts the microphone's mono input to
// the page in blocks of 1,024 samples; the page resamples and frames it.
const BLOCK_SAMPLES = 1024

class PcmCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.block = new Float32Array(BLOCK_SAMPLES)
    this.filled = 0
  }

  process(inputs) {
    const channel = inputs[0] && inputs[0][0]
    if (!channel) return true
    let offset = 0
    while (offset < channel.length) {
      const count = Math.min(channel.length - offset, BLOCK_SAMPLES - this.filled)
      this.block.set(channel.subarray(offset, offset + count), this.filled)
      this.filled += count
      offset += count
      if (this.filled === BLOCK_SAMPLES) {
        this.port.postMessage(this.block, [this.block.buffer])
        this.block = new Float32Array(BLOCK_SAMPLES)
        this.filled = 0
      }
    }
    return true
  }
}

registerProcessor('agentic-remote-pcm-capture', PcmCaptureProcessor)
