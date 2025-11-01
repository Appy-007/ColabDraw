
import { toast } from "react-toastify"

export default function Nav(){

    const handleLogout=()=>{
        const data=localStorage.getItem('data')
        if(!data){
            return
        }
        localStorage.removeItem('data')
        toast.success('User Logged out successfully !')
        window.location.href = '/'
    }
    return (
        <>
        <div className="flex justify-between z-50 px-4 bg-white">
            <h1>CorelDraw</h1>
            <button onClick={handleLogout} className="cursor-pointer">Logout</button>
        </div>
        </>
    )
}