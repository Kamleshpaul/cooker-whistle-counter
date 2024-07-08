'use client'

import SoundWaveCanvas from "@/components/SoundWaveCanvas";
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useEffect, useRef, useState } from "react"

export default function Home() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [whistleTargetCount, setWhistleTargetCount] = useState(1);
  const [whistleCount, setWhistleCount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const whistleStartTimeRef = useRef<number | null>(null);
  const firstWhistleDetectedRef = useRef<boolean>(false);

  const handleStartListening = async () => {
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      detectWhistle();
      setIsListening(true);
      firstWhistleDetectedRef.current = false;
    } catch (err) {
      console.error('Error accessing microphone:', err);
    } finally {
      setIsLoading(false);
      setOpenDrawer(false);
    }
  }

  const handleStopListening = () => {
    if (streamRef?.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const elem = document.getElementById('audio-ring') as HTMLAudioElement;

    if (elem) {
      elem.pause();
    }
    streamRef.current = null;
    setIsListening(false);
    setWhistleCount(0);
    firstWhistleDetectedRef.current = false;
    if (audioRef.current) {
      audioRef.current.close().then(() => {
        audioRef.current = null;
      });
    }
  }

  const detectWhistle = () => {
    if (!streamRef.current) return;
    audioRef.current = new AudioContext();
    const analyser = audioRef.current.createAnalyser();

    const audioSource = audioRef.current.createMediaStreamSource(streamRef.current);
    audioSource.connect(analyser);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const update = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      const scaleFactor = average / 100;
      const limitedScaleFactor = Math.min(5, 1 + scaleFactor);

      if (limitedScaleFactor > 1.5) {
        console.log('trigger');

        if (!firstWhistleDetectedRef.current) {
          setWhistleCount(prev => prev + 1);
          firstWhistleDetectedRef.current = true;
          whistleStartTimeRef.current = Date.now();
        }

        const diff = Date.now() - (whistleStartTimeRef?.current || 0);
        if (diff >= 5000) {
          setWhistleCount(prev => prev + 1);
          whistleStartTimeRef.current = Date.now();
        }

        console.log({
          diff: diff,
          whistleStartTimeRef: whistleStartTimeRef.current
        });

      }

      animationFrameRef.current = requestAnimationFrame(update);
    }

    audioRef.current.resume().then(() => {
      animationFrameRef.current = requestAnimationFrame(update);
    });
  };


  useEffect(() => {
    const elem = document.getElementById('audio-ring') as HTMLAudioElement;
    if (whistleTargetCount == whistleCount && elem) {
      elem.play();
    }
  }, [whistleCount, whistleTargetCount])

  return (
    <main className="bg-[#FFF5E1] h-screen w-screen">
      <audio src="/iphone_alarm.mp3" hidden loop={true} id="audio-ring"></audio>
      <h1 className="absolute top-24 w-full text-2xl font-bold text-center">Pressure Cooker Whistle Counter</h1>
      <div className="flex items-center justify-center h-screen w-full flex-col">
        <button
          onClick={() => {
            if (isListening) return;
            setOpenDrawer(true);
            setWhistleTargetCount(1);
          }}
          className="group z-10 relative inline-flex items-center justify-center overflow-hidden rounded-full size-32 border-2 border-[#C80036] bg-gradient-to-tr from-red-600 to-red-500 text-white shadow-lg transition duration-100 ease-in-out hover:shadow-red-500/50 active:translate-y-0.5 active:border-red-600 active:shadow-none">
          <span className="absolute inset-0 rounded-full bg-white opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-10"></span>
          <span className="relative font-medium text-2xl">{isListening ? whistleCount : 'Start'}</span>
        </button>

        {isListening && <SoundWaveCanvas className="size-20" mediaStream={streamRef.current} />}

        {isListening && <Button className="fixed bottom-5 w-[40%] text-xl font-bold uppercase" onClick={handleStopListening}>Stop</Button>}
      </div>

      <Drawer open={openDrawer} onOpenChange={val => setOpenDrawer(val)}>
        <DrawerContent>
          <DrawerHeader className="flex justify-center">
            <DrawerTitle>How many whistles do you want?</DrawerTitle>
            <DrawerDescription></DrawerDescription>
          </DrawerHeader>

          <div className="flex justify-center">
            <Button variant={'secondary'} className="text-2xl" onClick={() => { setWhistleTargetCount((prev) => prev < 20 ? prev + 1 : 20) }}>+</Button>
            <div className="size-10 flex justify-center items-center font-bold text-2xl">{whistleTargetCount}</div>
            <Button variant={'secondary'} className="text-2xl" onClick={() => { setWhistleTargetCount((prev) => prev > 1 ? prev - 1 : 1) }}>-</Button>
          </div>

          <DrawerFooter>
            <Button disabled={isLoading} onClick={handleStartListening}>{!isLoading ? 'Start listening' : 'Please wait...'}</Button>
            <Button onClick={() => { setOpenDrawer(false) }} variant="outline">Cancel</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </main>
  )
}