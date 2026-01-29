import { Bell, Search, Menu, LogOut, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";


const pageTitles = {
  "/admin": {
    title: "Admin Dashboard",
    subtitle: "Overview of system activity",
  },
  "/admin/projects": {
    title: "Projects",
    subtitle: "Manage all ongoing projects",
  },
  "/admin/leaders": {
    title: "Leaders",
    subtitle: "Team leaders overview",
  },
  "/admin/reports": {
    title: "Reports",
    subtitle: "Insights & analytics",
  },
  "/admin/admincalender": {
    title: "Calendar",
    subtitle: "Schedule & deadlines",
  },
  "/admin/adminsetting": {
    title: "Settings",
    subtitle: "Manage account & preferences",
  },
};

const AdminTopbar = ({ setSidebarOpen }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const {user} = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [name , setName] = useState();

  // const notifRef = useRef(null);
  const profileRef = useRef(null);

  const page = pageTitles[pathname] || {
    title: "Admin Panel",
    subtitle: "Welcome back, Admin",
  };

  useEffect(() => {
    console.log(user);
    setName(user.name);
    const img = localStorage.getItem("adminProfileImage");
    if (img) setProfileImage(img);
  }, []);

  // useEffect(() => {
  //   const handler = (e) => {
  //     if (notifRef.current && !notifRef.current.contains(e.target)) {
  //       setShowNotifications(false);
  //     }
  //     if (profileRef.current && !profileRef.current.contains(e.target)) {
  //       setShowProfile(false);
  //     }
  //   };
  //   document.addEventListener("mousedown", handler);
  //   return () => document.removeEventListener("mousedown", handler);
  // }, []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#D7E7E5]">
      <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-green-50"
          >
            <Menu size={22} className="text-[#235857]" />
          </button>

          {/* Header */}
          <div>
            <p className="text-sm font-semibold text-[#0D2426]">
              {/* {page.title} */}
              Admin Dashboard
            </p>
            <p className="text-xs text-gray-500">
              {/* {page.subtitle} */}
              Overview of system activity
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4 sm:gap-6">

          {/* SEARCH */}
          <div className="relative hidden md:block">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
            />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1F6F68]/30 focus:border-[#1F6F68] text-sm"
            />
          </div>

          {/* NOTIFICATIONS */}
          {/* <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200
                       flex items-center justify-center transition relative"
            >
              <Bell size={20}/>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-72 bg-white border rounded-2xl shadow-xl overflow-hidden -left-[180px]">
                <div className="p-4 font-semibold text-gray-800">
                  Notifications
                </div>
                <div className="divide-y">
                  {["New project assigned", "Report generated", "Leader updated task"].map(
                    (n, i) => (
                      <div
                        key={i}
                        className="p-4 text-[#6D8B8C]"
                      >
                        {n}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div> */}

          {/* PROFILE */}
          <div className="relative" ref={profileRef}>
            <div
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 pl-3 border-l border-green-200 cursor-pointer"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-800">{name}</p>
                <p className="text-xs text-gray-500">
                  Administrator
                </p>
              </div>

              <div className="w-9 h-9 rounded-full bg-[#235857] overflow-hidden flex items-center justify-center text-white text-xs font-black">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Admin"
                    className="w-full h-full object-cover"
                     onClick={() => navigate("/admin/adminsetting")}
                  />
                ) : (name?.charAt(0) || 'AU')}
              </div>
            </div>

            {showProfile && (
              <div className="absolute right-0 mt-3 w-48 bg-white border border-green-200 rounded-2xl shadow-xl overflow-hidden">
                <button
                  onClick={() => navigate("/admin/adminsetting")}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold hover:bg-green-50"
                >
                  <Settings size={16} /> Settings
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
