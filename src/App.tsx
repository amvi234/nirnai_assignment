import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './components/login'
import Home from './components/home';

function App() {

  return (
    <>
      <Router>
        <div className="App">
          <Routes>

            <Route path={'/'} element={<Login/>} />
            <Route path={'/home'} element={<Home/>} />
          </Routes>
          </div>
      </Router>
    </>
  )
}

export default App
