'use client'

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useRef, useState } from "react"



export default function Home() {

  const [openDrawer, setOpenDrawer] = useState(false);
  const [whistleTargetCount, setWhistleTargetCount] = useState(1);
  const [whistleCount, setWhistleCount] = useState(0);

  const [isListening, setIsListening] = useState(false);

  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);


  const handleStartListening = async () => {

    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext)();
      analyser.current = audioContext.current.createAnalyser();
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContext.current.createMediaStreamSource(stream);
      if (!analyser?.current) throw new Error('Error creating analyser.');

      source.connect(analyser.current);
      setIsListening(true);
      detectWhistle();
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }

    setOpenDrawer(false);
  }

  const detectWhistle = () => {
    if (!isListening) return;
    if (!analyser?.current) return;

    const bufferLength = analyser.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.current.getByteFrequencyData(dataArray);

    const highFreqSum = dataArray.slice(Math.floor(bufferLength * 0.8)).reduce((a, b) => a + b, 0);

    console.log({ highFreqSum });

    // if (highFreqSum > 10000) { // Adjust this threshold as needed
    //   setCount(prevCount => {
    //     const newCount = prevCount + 1;
    //     if (newCount === targetCount) {
    //       playAlarm();
    //     }
    //     return newCount;
    //   });
    // }

    requestAnimationFrame(detectWhistle);
  };

  return (
    <main className="bg-[#FFF5E1] h-screen w-screen">


      <div className="flex items-center justify-center h-screen w-full flex-col">

        <h1 className="text-2xl font-bold text-center mb-20">Pressure Cooker Whistle Counter</h1>

        <button
          onClick={() => { if (isListening) return; setOpenDrawer(true) }}
          className="group relative inline-flex items-center justify-center overflow-hidden rounded-full size-32 border-2 border-[#C80036] bg-gradient-to-tr from-red-600 to-red-500 text-white shadow-lg transition duration-100 ease-in-out hover:shadow-red-500/50 active:translate-y-0.5 active:border-red-600 active:shadow-none">
          <span className="absolute inset-0 rounded-full bg-white opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-10"></span>
          <span className="relative font-medium text-2xl">{isListening ? whistleCount : 'Start'}</span>
        </button>

        {isListening && <Button className="fixed bottom-5 w-[60%] text-xl font-bold uppercase" onClick={handleStopListening}>Stop</Button>}

      </div>


      <Drawer open={openDrawer} onOpenChange={val => setOpenDrawer(val)}>
        <DrawerContent>

          <DrawerHeader className="flex justify-center">
            <DrawerTitle>How many whistle you want?</DrawerTitle>
            <DrawerDescription></DrawerDescription>
          </DrawerHeader>

          <div className="flex justify-center">
            <Button variant={'secondary'} className="text-2xl" onClick={() => { setWhistleTargetCount((prev) => prev < 20 ? prev + 1 : 20) }}>+</Button>
            <div className="size-10 flex justify-center items-center font-bold text-2xl">{whistleTargetCount}</div>
            <Button variant={'secondary'} className="text-2xl" onClick={() => { setWhistleTargetCount((prev) => prev > 1 ? prev - 1 : 1) }}>-</Button>
          </div>

          <DrawerFooter>
            <Button onClick={handleStartListening}>Start listening</Button>
            <Button onClick={() => { setOpenDrawer(false) }} variant="outline">Cancel</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </main>
  )
}