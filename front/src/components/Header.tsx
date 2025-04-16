
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="w-full py-4 px-6 md:px-12 bg-white shadow-sm fixed top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-gray-900">简洁空白页</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#home" className="text-gray-700 hover:text-gray-900 font-medium">
            首页
          </a>
          <a href="#features" className="text-gray-700 hover:text-gray-900 font-medium">
            特点
          </a>
          <a href="#contact" className="text-gray-700 hover:text-gray-900 font-medium">
            联系
          </a>
          <Button className="bg-gray-900 hover:bg-gray-800">立即开始</Button>
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden pt-4 pb-6 px-6 bg-white">
          <div className="flex flex-col space-y-4">
            <a
              href="#home"
              className="text-gray-700 hover:text-gray-900 font-medium py-2"
              onClick={toggleMenu}
            >
              首页
            </a>
            <a
              href="#features"
              className="text-gray-700 hover:text-gray-900 font-medium py-2"
              onClick={toggleMenu}
            >
              特点
            </a>
            <a
              href="#contact"
              className="text-gray-700 hover:text-gray-900 font-medium py-2"
              onClick={toggleMenu}
            >
              联系
            </a>
            <Button className="bg-gray-900 hover:bg-gray-800 w-full">立即开始</Button>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
