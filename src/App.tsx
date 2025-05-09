import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SCPLSTATS from './components/scpsl-stats'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SCPLSTATS />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
