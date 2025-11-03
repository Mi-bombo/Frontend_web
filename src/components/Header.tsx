import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"

export default function Header() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);


    const handleSubmit = () => {
        // await logoutUser();
        navigate("/");
    }

const navLLinks = [
    {to: "/al", label: "Home"},
    // aca van a ir todas las otras rutas
]

useEffect(()=>{
    const handleScroll = ()=>{
        setScrolled(window.scrollY > 50);
    }
    window.addEventListener("scroll", handleScroll);
    return () => {
        window.removeEventListener("scroll", handleScroll);
    }
},[])
    
  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav > 
                <ul className="flex space-x-4 ">
                    {navLLinks.map((link) => (
                        <li key={link.to}>
                            <a href={link.to} className="text-gray-700 hover:text-gray-900">
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    </header>
  )
}
