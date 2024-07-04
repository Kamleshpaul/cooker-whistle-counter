import { cn } from '@/lib/utils';
import React, { useEffect, useRef, FC } from 'react';

interface SoundWaveCanvasProps {
  className: string;
  mediaStream: MediaStream | null;
  style?: React.CSSProperties;
  children?: React.ReactNode
}

const SoundWaveCanvas: FC<SoundWaveCanvasProps> = ({ mediaStream, style, className }) => {
  const pluseRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!pluseRef.current || !mediaStream) return;
    if (!mediaStream.getAudioTracks().length) return;


    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();

    const audioSource = audioContext.createMediaStreamSource(mediaStream);
    audioSource.connect(analyser);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updatePulse = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      const scaleFactor = average / 100;
      const limitedScaleFactor = Math.min(2, 1 + scaleFactor); // Limit to a maximum of 2

      if (!pluseRef.current) return;
      pluseRef.current.style.transform = `scale(${limitedScaleFactor})`;
      requestAnimationFrame(updatePulse);
    }

    audioContext.resume().then(() => {
      updatePulse();
    });

    return () => {
      audioContext.close();
    };
  }, [mediaStream]);

  return <div className={cn('absolute w-32 h-32 bg-[#FF6969] rounded-full opacity-75', className)} ref={pluseRef} style={style}></div>;
};

export default SoundWaveCanvas;