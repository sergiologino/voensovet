import React, { useState } from 'react';
import { MenuIcon, XIcon, UserIcon } from 'lucide-react';
import { Button } from '../ui/Button';
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigation = [{
    name: 'Помощь',
    href: '#help'
  }, {
    name: 'Права и льготы',
    href: '#benefits'
  }, {
    name: 'Возвращение к жизни',
    href: '#return'
  }, {
    name: 'Жалобы',
    href: '#complaints'
  }, {
    name: 'Организации',
    href: '#organizations'
  }];
  return <header className="bg-white border-b-2 border-[#e5e5e5] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#2c5f8d] rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">П</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#262626]">
                Портал Поддержки
              </h1>
              <p className="text-xs text-[#737373] font-mono">Помощь и права</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navigation.map(item => <a key={item.name} href={item.href} className="px-4 py-2 text-sm text-[#404040] hover:text-[#2c5f8d] hover:bg-[#f0f4f8] rounded-lg transition-colors">
                {item.name}
              </a>)}
          </nav>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <select className="px-3 py-2 text-sm border-2 border-[#d4d4d4] rounded-lg bg-white text-[#404040] focus:outline-none focus:border-[#2c5f8d]">
              <option>RU</option>
            </select>
            <Button variant="ghost" size="sm">
              <UserIcon size={18} className="mr-2" />
              Войти
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2 text-[#404040] hover:bg-[#f5f5f5] rounded-lg" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && <div className="lg:hidden py-4 border-t-2 border-[#e5e5e5]">
            <nav className="flex flex-col gap-2">
              {navigation.map(item => <a key={item.name} href={item.href} className="px-4 py-3 text-base text-[#404040] hover:bg-[#f0f4f8] rounded-lg">
                  {item.name}
                </a>)}
              <div className="flex items-center gap-4 px-4 py-3">
                <select className="flex-1 px-3 py-2 text-sm border-2 border-[#d4d4d4] rounded-lg bg-white">
                  <option>RU</option>
                </select>
                <Button variant="ghost" size="sm">
                  <UserIcon size={18} className="mr-2" />
                  Войти
                </Button>
              </div>
            </nav>
          </div>}
      </div>
    </header>;
}