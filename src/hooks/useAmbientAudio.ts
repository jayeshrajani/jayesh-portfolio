"use client";

import { useEffect, useRef, useState } from "react";

type AudioEngine = {
  ambientTimer: number | null;
  context: AudioContext;
  master: GainNode;
  modulators: OscillatorNode[];
  noiseBuffer: AudioBuffer;
  sources: AudioBufferSourceNode[];
};

function createNoiseBuffer(context: AudioContext) {
  const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
  const samples = buffer.getChannelData(0);
  let smoothedNoise = 0;

  for (let index = 0; index < samples.length; index += 1) {
    smoothedNoise = smoothedNoise * 0.965 + (Math.random() * 2 - 1) * 0.035;
    samples[index] = smoothedNoise;
  }

  return buffer;
}

function playTone(
  engine: AudioEngine | null,
  frequency: number,
  endFrequency: number,
  duration: number,
  volume: number,
  delay = 0,
  type: OscillatorType = "triangle",
) {
  if (!engine || engine.context.state !== "running") return;

  const { context } = engine;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const start = context.currentTime + delay;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(engine.master);
  oscillator.start(start);
  oscillator.stop(start + duration);
}

function playNoiseBurst(
  engine: AudioEngine | null,
  duration: number,
  volume: number,
  frequency: number,
  delay = 0,
) {
  if (!engine || engine.context.state !== "running") return;

  const { context } = engine;
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  const start = context.currentTime + delay;

  source.buffer = engine.noiseBuffer;
  filter.type = "lowpass";
  filter.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(filter).connect(gain).connect(engine.master);
  source.start(start, Math.random() * 1.5, duration);
  source.stop(start + duration);
}

function playBirdCall(engine: AudioEngine) {
  playTone(engine, 1320, 1880, 0.12, 0.009, 0, "sine");
  playTone(engine, 1540, 2180, 0.1, 0.007, 0.17, "sine");
}

function scheduleBirdCall(engine: AudioEngine) {
  engine.ambientTimer = window.setTimeout(
    () => {
      if (engine.context.state === "running") playBirdCall(engine);
      scheduleBirdCall(engine);
    },
    7000 + Math.random() * 9000,
  );
}

function createAudioEngine() {
  const context = new AudioContext();
  const master = context.createGain();
  const noiseBuffer = createNoiseBuffer(context);
  const sources: AudioBufferSourceNode[] = [];
  const modulators: OscillatorNode[] = [];

  master.gain.value = 0.78;
  master.connect(context.destination);

  const createAmbientLayer = (
    filterType: BiquadFilterType,
    frequency: number,
    baseVolume: number,
    movement: number,
    rate: number,
  ) => {
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const lfo = context.createOscillator();
    const lfoGain = context.createGain();

    source.buffer = noiseBuffer;
    source.loop = true;
    filter.type = filterType;
    filter.frequency.value = frequency;
    filter.Q.value = 0.7;
    gain.gain.value = baseVolume;
    lfo.type = "sine";
    lfo.frequency.value = rate;
    lfoGain.gain.value = movement;

    source.connect(filter).connect(gain).connect(master);
    lfo.connect(lfoGain).connect(gain.gain);
    source.start();
    lfo.start();
    sources.push(source);
    modulators.push(lfo);
  };

  createAmbientLayer("lowpass", 680, 0.04, 0.014, 0.1);
  createAmbientLayer("bandpass", 360, 0.014, 0.006, 0.065);

  const engine: AudioEngine = {
    ambientTimer: null,
    context,
    master,
    modulators,
    noiseBuffer,
    sources,
  };
  scheduleBirdCall(engine);
  return engine;
}

export function useAmbientAudio() {
  const engine = useRef<AudioEngine | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    return () => {
      if (engine.current?.ambientTimer) window.clearTimeout(engine.current.ambientTimer);
      engine.current?.sources.forEach((source) => source.stop());
      engine.current?.modulators.forEach((oscillator) => oscillator.stop());
      void engine.current?.context.close();
    };
  }, []);

  const toggle = async () => {
    if (!engine.current) engine.current = createAudioEngine();

    if (enabled) {
      await engine.current.context.suspend();
      setEnabled(false);
      return;
    }

    await engine.current.context.resume();
    setEnabled(true);
    playTone(engine.current, 360, 520, 0.16, 0.028, 0, "sine");
  };

  return {
    enabled,
    toggle,
    playDoor: () => {
      playNoiseBurst(engine.current, 0.28, 0.035, 620);
      playTone(engine.current, 132, 66, 0.3, 0.045, 0, "sawtooth");
    },
    playEnter: () => {
      playNoiseBurst(engine.current, 0.42, 0.024, 1480, 0.08);
      playTone(engine.current, 210, 410, 0.34, 0.022, 0.08, "sine");
    },
    playExit: () => playTone(engine.current, 430, 210, 0.26, 0.024, 0, "sine"),
    playFootstep: () => {
      playNoiseBurst(engine.current, 0.065, 0.014, 520);
      playTone(engine.current, 86, 58, 0.07, 0.012);
    },
    playLocation: () => {
      playTone(engine.current, 280, 410, 0.18, 0.018, 0, "sine");
      playTone(engine.current, 420, 560, 0.2, 0.014, 0.1, "sine");
    },
    playProximity: () => {
      playTone(engine.current, 540, 680, 0.1, 0.014, 0, "sine");
      playTone(engine.current, 690, 820, 0.1, 0.011, 0.08, "sine");
    },
    playReveal: () => {
      playTone(engine.current, 340, 680, 0.34, 0.02, 0, "sine");
      playTone(engine.current, 510, 840, 0.3, 0.014, 0.09, "sine");
    },
  };
}