
import './App.css'
import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import Home from './pages/Home'
import Room from './pages/Room'
import Nav from './components/Nav'

const router=createBrowserRouter([
  {
    path:'/home',
    element:<Home/>
  },
  {
    path:'/room/:roomId',
    element:<Room/>
  }
])



function App() {
  

  return (
    <>
      <Nav/>
      <RouterProvider router={router}/>
    </>
  )
}

export default App
