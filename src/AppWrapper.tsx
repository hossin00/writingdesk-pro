import { useState } from 'react'
import SplashScreen from './components/SplashScreen'
import Onboarding from './components/Onboarding'
import App from './App'

const DONE_KEY = 'writingdesk-pro_onboarded_v1'
type Phase = 'splash' | 'onboard' | 'app'

export default function AppWrapper() {
  const [phase, setPhase] = useState<Phase>('splash')
  const features = ["Zen distraction-free mode", "Word count and goals", "Auto-save drafts", "Focus timer built-in"]
  return (
    <>
      {phase === 'splash' && <SplashScreen onDone={()=>setPhase(localStorage.getItem(DONE_KEY)?'app':'onboard')} color1="#64748b" color2="#475569" emoji="✍️" name="WritingDesk Pro" tagline="Distraction-free writing environment"/>}
      {phase === 'onboard' && <Onboarding onDone={()=>{localStorage.setItem(DONE_KEY,'1');setPhase('app')}} color1="#64748b" emoji="✍️" name="WritingDesk Pro" features={features}/>}
      {phase === 'app' && <App/>}
    </>
  )
}