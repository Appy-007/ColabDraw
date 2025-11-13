
import './App.css'
import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import Home from './pages/Home'
import Room from './pages/Room'
import Nav from './components/Nav'
import Register from './pages/Register'
import { ToastContainer } from 'react-toastify'

const router=createBrowserRouter([
  {
    path:'/',
    element:<Register/>
  },
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
      <ToastContainer position="top-center" autoClose={2000}/>
    </>
  )
}

export default App
