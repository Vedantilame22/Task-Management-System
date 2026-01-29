

import React, { useState, useEffect } from "react";
import { updateUser } from "../../api/userApi";
import { useNavigate } from "react-router-dom";
import {
  User,
  Monitor,
  Bell,
  AlertTriangle,
  Camera,
  Settings,
  Globe,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const AdminSettings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  /* ================= STATES ================= */
  const [darkMode, setDarkMode] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [systemDomain, setSystemDomain] = useState("");
  const [language, setLanguage] = useState("English");
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    reminder: true,
  });

 
  useEffect(() => {
    if (user) {
      setFullName(user.name || "");
      setEmail(user.email || "");
      setSystemDomain(user.domain || "");
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const savedImage = localStorage.getItem("adminProfileImage");
    if (savedImage) setProfileImage(savedImage);
  }, []);

  /* ================= HANDLERS ================= */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
      localStorage.setItem("adminProfileImage", reader.result);
      toast.success("Profile picture updated!");
    };
    reader.readAsDataURL(file);
  };

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const saveProfile = async () => {
    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    try {
      // const userData = {
      //   name : fullName,
      //   email : email,
      //   domain : systemDomain
      // }
      const response = await updateUser({name : fullName , email , domain : systemDomain});
      console.log(response);
      toast.success("Profile updated successfully!");
      
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const saveTheme = () => {
    localStorage.setItem("darkMode", darkMode);
    toast.success("Theme preferences saved");
  };

  const saveRegion = () => {
    localStorage.setItem("language", language);
    localStorage.setItem("timezone", timezone);
    toast.success(`Region settings saved: ${language} - ${timezone}`);
  };

  const saveNotifications = () => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
    toast.success("Notification preferences saved");
  };

  const logoutAll = () => {
    if (window.confirm("Are you sure you want to logout from all sessions?")) {
      logout();
      toast.success("Logged out successfully");
      navigate("/login", { replace: true });
    }
  };

  const deleteAccount = () => {
    if (window.confirm("⚠️ WARNING: This action cannot be undone. Are you sure you want to delete your account?")) {
      toast.error("Account deletion is currently disabled. Please contact support.");
     
    }
  };

 
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="flex items-center gap-4">
        <div>
          <Settings size={24} className="text-[#1f6f68]"/>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#0D2426] flex items-center gap-2">
            Settings
          </h2>
          <p className="text-[#6D8B8C] mt-1 text-sm">
            Manage account and system preferences
          </p>
        </div>
      </div>

      {/* 1. ACCOUNT */}
      <section className="bg-white rounded-3xl border-l-4 border-[#1F6F68] shadow-sm overflow-hidden">
        <div className="p-5 flex items-center gap-2">
          <User size={18} className="text-[#235857] font-bold w-8 h-8 rounded-full" />
          <h3 className="text-[#1F6F68]">
            Account Information
          </h3>
        </div>

        <div className="p-6 sm:p-8">
          {/* PROFILE IMAGE */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#235857] overflow-hidden flex items-center justify-center text-white text-3xl font-black border-4 border-white shadow-md">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || "AU"
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-[#235857] text-white rounded-full cursor-pointer hover:scale-110 transition shadow-lg border-2 border-white">
                <Camera size={16} />
                <input 
                  type="file" 
                  hidden 
                  accept="image/*"
                  onChange={handleImageChange} 
                />
              </label>
            </div>
            <p className="mt-2 text-xs text-[#6D8B8C] tracking-tighter">
              Click camera icon to change profile picture
            </p>
          </div>

          {/* FORM */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="text-xs text-[#6D8B8C] ml-1">
                Full Name
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="mt-1 w-full rounded-xl border px-4 py-2 text-sm bg-gray-50 focus:bg-white focus:border-[#235857] focus:ring-2 focus:ring-[#235857]/20 outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs text-[#6D8B8C] ml-1">
                Email Address
              </label>
              <input
                value={email}
                disabled
                className="mt-1 w-full rounded-xl border px-4 py-2 text-sm bg-gray-100 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-[#6D8B8C]">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label className="text-xs text-[#6D8B8C] ml-1">
                System Domain
              </label>
              <input
                value={systemDomain}
                onChange={(e) => setSystemDomain(e.target.value)}
                placeholder="e.g., Admin, IT"
                className="mt-1 w-full rounded-xl border px-4 py-2 text-sm bg-gray-50 focus:bg-white focus:border-[#235857] focus:ring-2 focus:ring-[#235857]/20 outline-none transition"
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mt-0.5">
                i
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">Account Details</p>
                <p className="text-xs text-blue-700 mt-1">
                  Role: <span className="font-semibold">{user?.role || "Admin"}</span>
                  {" · "}
                  Member since: <span className="font-semibold">
                    {user?.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"
                    }
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* UPDATE PROFILE BUTTON */}
          <button
            onClick={saveProfile}
            className="mt-5 px-5 py-2 rounded-xl bg-[#1F6F68] text-white text-sm font-medium hover:bg-[#235857] transition"
          >
            Update Profile
          </button>
        </div>
      </section>

      {/* 2. NOTIFICATIONS */}
      <section className="bg-white rounded-3xl border-l-4 border-[#1F6F68] shadow-sm overflow-hidden">
        <div className="p-5 flex items-center gap-2">
          <Bell size={18} className="text-[#1F6F68]" />
          <h3 className="text-[#1F6F68]">Notifications</h3>
        </div>
        <div className="p-6 space-y-4">
          {[
            { key: "email", label: "Email Notifications", desc: "Receive updates via email" },
            { key: "push", label: "Push Notifications", desc: "Browser push notifications" },
            { key: "reminder", label: "Task Reminders", desc: "Get reminders for upcoming deadlines" }
          ].map(({ key, label, desc }) => (
            <div
              key={key}
              className="flex items-center justify-between p-4 rounded-2xl bg-[#F4F8F8] border-2 border-transparent hover:border-[#235857]/20 transition"
            >
              <div>
                <p className="text-sm font-medium text-[#0D2426]">{label}</p>
                <p className="text-xs text-[#6D8B8C] mt-1">{desc}</p>
              </div>
              <div
                onClick={() => toggleNotification(key)}
                className={`w-14 h-7 rounded-full cursor-pointer flex items-center px-1 transition duration-300 ${
                  notifications[key] ? "bg-[#235857]" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                    notifications[key] ? "translate-x-7" : ""
                  }`}
                />
              </div>
            </div>
          ))}
          <button
            onClick={saveNotifications}
            className="mt-5 px-5 py-2 rounded-xl bg-[#1F6F68] text-white text-sm font-medium hover:bg-[#235857] transition"
          >
            Save Preferences
          </button>
        </div>
      </section>

      {/* 3. DANGER ZONE */}
      <section className="bg-red-50/50 rounded-3xl border-l-4 border-red-500 shadow-sm overflow-hidden">
        <div className="p-5 flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-500" />
          <h3 className="text-red-600 font-semibold">Danger Zone</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-4 bg-white rounded-xl border border-red-100">
            <h4 className="font-medium text-gray-800 mb-1">Logout All Sessions</h4>
            <p className="text-xs text-gray-600 mb-3">
              Sign out from all devices and browsers
            </p>
            <button
              onClick={logoutAll}
              className="px-5 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition"
            >
              Logout Everywhere
            </button>
          </div>

          {/* <div className="p-4 bg-white rounded-xl border border-red-200">
            <h4 className="font-medium text-gray-800 mb-1">Delete Account</h4>
            <p className="text-xs text-gray-600 mb-3">
              ⚠️ This action cannot be undone. All data will be permanently deleted.
            </p>
            <button
              onClick={deleteAccount}
              className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition"
            >
              Delete My Account
            </button>
          </div> */}
        </div>
      </section>

    </div>
  );
};

export default AdminSettings;