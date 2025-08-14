export function playBeep(frequency = 880, durationMs = 150, volume = 0.05) {
  try {
    const AudioContextImpl = window.AudioContext || window.webkitAudioContext
    const audioCtx = new AudioContextImpl()

    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.value = frequency

    gainNode.gain.value = volume

    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    oscillator.start()
    setTimeout(() => {
      oscillator.stop()
      audioCtx.close()
    }, durationMs)
  } catch (e) {
    // Fail silently if audio is not available
    console.warn('Audio not available for beep:', e)
  }
}