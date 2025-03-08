import React from "react";
import {
  X,
  User,
  Settings,
  CreditCard,
  Gift,
  HelpCircle,
  LogOut,
  Shield,
  History,
  Star,
} from "lucide-react";

interface SideNavProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const SideNav: React.FC<SideNavProps> = ({ isOpen, onClose, onLogout }) => {
  // console.log(onLogout);

  if (!isOpen) return null;

  const menuItems = [
    { icon: <User size={20} />, label: "My Profile" },
    { icon: <History size={20} />, label: "Transaction History" },
    { icon: <CreditCard size={20} />, label: "Payment Methods" },
    { icon: <Star size={20} />, label: "VIP Program" },
    { icon: <Gift size={20} />, label: "Referrals & Rewards" },
    { icon: <Settings size={20} />, label: "Settings" },
    { icon: <Shield size={20} />, label: "Security" },
    { icon: <HelpCircle size={20} />, label: "Help & Support" },
  ];

  const handleLogOut = () => {
    onLogout();
    onClose();
  };
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}></div>

      <div className="fixed top-0 right-0 bottom-0 w-[280px] bg-gradient-to-b from-[#252547] to-[#1A1A2E] z-50 animate-slideInRight">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-purple-500/10">
            <h2 className="text-xl font-bold text-white">Menu</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1A1A2E] text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* User Info */}
          <div className="p-5 border-b border-purple-500/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xl">
                J
              </div>
              <div>
                <h3 className="text-white font-semibold">John Doe</h3>
                <p className="text-gray-400 text-sm">VIP Level 2</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            <nav className="p-3">
              <ul className="space-y-1">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <button className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-purple-500/10 hover:text-white transition-colors">
                      <span className="text-purple-400">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Logout Button */}
          <div className="p-5 border-t border-purple-500/10">
            <button
              onClick={handleLogOut}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-[#1A1A2E] text-red-400 hover:bg-red-500/10 transition-colors border border-red-500/20"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SideNav;
