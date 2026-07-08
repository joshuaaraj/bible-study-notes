import Sidebar from './Sidebar'
import MainContent from './MainContent'

export default function AppShell(): JSX.Element {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <MainContent />
    </div>
  )
}
