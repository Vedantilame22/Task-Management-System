import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Menu, Check, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { notificationService } from "../../api/notificationsApi";
import { toast } from "react-toastify";

export default function Topbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(localStorage.getItem("profileAvatar"));
  const [search, setSearch] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  
  // Notification state
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
    const syncAvatar = () => setAvatar(localStorage.getItem("profileAvatar"));
    window.addEventListener("storage", syncAvatar);
    
    if (user) {
      setName(user.name);
    }
    
    fetchNotifications();
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
      if (isNotificationOpen) {
        fetchNotifications();
      }
    }, 30000);

    return () => {
      window.removeEventListener("storage", syncAvatar);
      clearInterval(interval);
    };
  }, [user, isNotificationOpen]);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await notificationService.getNotifications({
        limit: 10,
        sort: '-createdAt'
      });
      
      if (response.success) {
        setNotifications(response.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.read) {
      await handleMarkAsRead(notification._id, { stopPropagation: () => {} });
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'task_assigned':
        navigate('/employee/tasks');
        break;
      case 'project_assigned':
        navigate('/employee');
        break;
      case 'task_updated':
        navigate('/employee/tasks');
        break;
      default:
        break;
    }
    
    setIsNotificationOpen(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_assigned':
        return '📋';
      case 'project_assigned':
        return '📁';
      case 'task_updated':
        return '🔄';
      case 'deadline_reminder':
        return '⏰';
      default:
        return '🔔';
    }
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <header className="h-16 bg-white border-b border-[#D3D9D4] px-4 md:px-6 flex items-center justify-between gap-3 sticky top-0 z-50">
      {/* LEFT */}
      <div className={`flex items-center gap-3 ${isMobileSearchOpen ? 'hidden' : 'flex'}`}>
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu />
        </button>

        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-[#0D2426]">
            Employee workspace
          </p>
          <p className="text-xs text-[#6D8B8C]">
            Manage your tasks and schedule
          </p>
        </div>
      </div>

      {/* CENTER (hide on mobile) */}
      <div className={`flex-1 items-center justify-center px-4 ${isMobileSearchOpen ? 'flex absolute inset-0 bg-white z-10 px-6' : 'hidden md:flex'}`}>
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6D8B8C]" size={18} />
          <input
            className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-[#D3D9D4] text-sm focus:outline-none focus:border-[#235857] focus:ring-2 focus:ring-[#235857]/20"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button 
            onClick={() => setIsMobileSearchOpen(false)}
            className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 text-[#6D8B8C]"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* RIGHT */}
      <div className={`flex items-center gap-3 ${isMobileSearchOpen ? 'hidden' : 'flex'}`}>
        
        {/* Mobile Search Toggle */}
        <button 
          onClick={() => setIsMobileSearchOpen(true)}
          className="md:hidden w-10 h-10 flex items-center justify-center text-[#235857] hover:bg-[#F4F8F8] rounded-xl transition"
        >
          <Search size={20} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => {
              setIsNotificationOpen(!isNotificationOpen);
              if (!isNotificationOpen) {
                fetchNotifications();
              }
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${
              isNotificationOpen ? 'bg-[#235857] text-white' : 'bg-[#F4F8F8] text-[#235857] hover:bg-[#D3D9D4]/60'
            }`}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-[#D3D9D4] overflow-hidden z-[60]">
              {/* Header */}
              <div className="px-4 py-3 border-b border-[#F4F8F8] flex justify-between items-center bg-[#F4F8F8]">
                <span className="text-sm font-bold text-[#0D2426]">
                  Notifications {unreadCount > 0 && `(${unreadCount})`}
                </span>
                {notifications.length > 0 && unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-[#235857] hover:text-[#1a4443] font-medium flex items-center gap-1"
                  >
                    <Check size={12} />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-[400px] overflow-y-auto">
                {loadingNotifications ? (
                  <div className="px-4 py-8 text-center">
                    <div className="w-8 h-8 border-4 border-[#235857] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs text-[#6D8B8C]">Loading...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-12 text-center">
                    <Bell size={32} className="mx-auto text-[#D3D9D4] mb-2" />
                    <p className="text-sm text-[#6D8B8C]">No notifications</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`px-4 py-3 hover:bg-[#F4F8F8] cursor-pointer border-b border-[#F4F8F8] transition-colors ${
                        !notification.read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium ${
                            !notification.read ? 'text-[#0D2426]' : 'text-[#6D8B8C]'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-[#6D8B8C] mt-1">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={(e) => handleMarkAsRead(notification._id, e)}
                            className="p-1 hover:bg-[#D3D9D4] rounded-full transition-colors"
                            title="Mark as read"
                          >
                            <Check size={14} className="text-[#235857]" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {/* {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-[#F4F8F8] bg-[#F4F8F8]">
                  <button
                    onClick={() => {
                      navigate('/employee/notifications');
                      setIsNotificationOpen(false);
                    }}
                    className="w-full text-xs text-[#235857] hover:text-[#1a4443] font-medium py-1"
                  >
                    View all notifications
                  </button>
                </div>
              )} */}
            </div>
          )}
        </div>

        {/* Profile */}
        <button
          onClick={() => navigate("/employee/settings")}
          className="flex items-center gap-2"
        >
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium">{name || "Employee"}</p>
            <p className="text-xs text-gray-500">{user?.role || "Employee"}</p>
          </div>

          <div className="w-9 h-9 rounded-full bg-[#235857] text-white flex items-center justify-center overflow-hidden">
            {avatar ? (
              <img src={avatar} className="h-full w-full object-cover" alt="Profile" />
            ) : (
              name?.charAt(0) || "E"
            )}
          </div>
        </button>
      </div>
    </header>
  );
}