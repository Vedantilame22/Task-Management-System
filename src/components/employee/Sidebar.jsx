import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  CalendarDays,
  Settings,
  LogOut,
  X,
} from "lucide-react";

import logo from "/image/logo.png";

const menu = [
  { name: "Dashboard", path: "/employee", icon: LayoutDashboard },
  { name: "Tasks", path: "/employee/tasks", icon: CheckSquare },
  { name: "Teams", path: "/employee/teams", icon: Users },
  { name: "Calendar", path: "/employee/calendar", icon: CalendarDays },
  { name: "Settings", path: "/employee/settings", icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-64
          bg-[#EAF4F3] border-r border-[#D7E7E5]
          flex flex-col
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* HEADER */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#D7E7E5]">
          <img src={logo} alt="Graphura" className="h-9" />
          <button onClick={onClose} className="md:hidden">
            <X />
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                end={item.path === "/employee"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
                  ${
                    isActive
                      ? "bg-[#1F6F68] text-white"
                      : "text-[#355E5A] hover:bg-[#DDF0ED]"
                  }`
                }
              >
                <Icon size={18} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div className="px-4 py-4 border-t border-[#D7E7E5]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl
                       text-sm font-medium text-[#8B3A3A] hover:bg-red-50"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}
