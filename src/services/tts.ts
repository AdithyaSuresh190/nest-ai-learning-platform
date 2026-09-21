let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speak(text: string, opts?: { rate?: number; pitch?: number; voice?: string }) {
  if (!('speechSynthesis' in window)) {
    console.warn('Text-to-Speech not supported in this browser');
    return;
  }
  stopSpeaking();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = opts?.rate ?? 0.9;
  utterance.pitch = opts?.pitch ?? 1.1;
  if (opts?.voice) {
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) => v.name === opts.voice);
    if (match) utterance.voice = match;
  }
  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}

export function isSpeaking() {
  return 'speechSynthesis' in window && window.speechSynthesis.speaking;
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) return [];
  return window.speechSynthesis.getVoices();
}
