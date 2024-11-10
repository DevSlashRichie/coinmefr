'use client';
import { Bell, HeartPulse, House, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface NavBarButtonProps {
  text: string;
  href?: string;
  children?: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}

interface NavbarProps {
  selected: string;
}

const NavBarButton: React.FC<NavBarButtonProps> = ({ text, href = '/', selected, children, onClick }) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex flex-col w-full items-center text-[12px] text-black ${
        selected ? 'text-[#A7E96B]' : 'text-gray-500'
      } rounded-lg py-1`}
    >
      <div className="relative aspect-square h-6">{children}</div>
      {text}
    </Link>
  );
};

const Navbar: React.FC<NavbarProps> = ({ selected }) => {
  const [selectedButton, setSelectedButton] = useState(selected);

  const handleButtonClick = (buttonText: string) => {
    setSelectedButton(buttonText);
  };

  return (
    <div className="flex w-screen justify-between text-black bg-white border-t border-gray-300 px-8 py-4 gap-[10px] fixed bottom-0">
      <NavBarButton
        text={'Inicio'}
        selected={selectedButton === 'Inicio'}
        onClick={() => handleButtonClick('Inicio')}
        href="dashboard"
      >
        <House className="w-6 h-6" />
      </NavBarButton>
      <NavBarButton
        text={'Salud'}
        selected={selectedButton === 'Salud'}
        onClick={() => handleButtonClick('Salud')}
        href="salud"
      >
        <HeartPulse className="w-6 h-6" />
      </NavBarButton>
      <NavBarButton
        text={'Alertas'}
        selected={selectedButton === 'Alertas'}
        onClick={() => handleButtonClick('Alertas')}
        href="alertas"
      >
        <Bell className="w-6 h-6" />
      </NavBarButton>
      <NavBarButton
        text={'Gestión'}
        selected={selectedButton === 'Gestión'}
        onClick={() => handleButtonClick('Gestión')}
        href="gestion"
      >
        <LayoutGrid className="w-6 h-6" />
      </NavBarButton>
    </div>
  );
};

export default Navbar;
