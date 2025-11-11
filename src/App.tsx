import './index.css'
import { AppRouter } from './pages/AppRouter'
import { ContextUser } from './context/AppContext'

function App() {
  return (
    <>
      <ContextUser>
        <AppRouter />
      </ContextUser>
    </>
  )
}

export default App
