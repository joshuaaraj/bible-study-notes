import { useEffect, useState } from 'react'
import FirstLaunchSetup from './components/setup/FirstLaunchSetup'
import AppShell from './components/layout/AppShell'

export default function App(): JSX.Element {
  const [loading, setLoading] = useState(true)
  const [firstLaunch, setFirstLaunch] = useState(false)

  useEffect(() => {
    window.api.config.isFirstLaunch().then((result) => {
      setFirstLaunch(result)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (firstLaunch) {
    return <FirstLaunchSetup onComplete={() => setFirstLaunch(false)} />
  }

  return <AppShell />
}
