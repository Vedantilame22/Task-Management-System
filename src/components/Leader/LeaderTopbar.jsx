import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Menu, Search, Plus, X, Check, Trash2 } from "lucide-react";
import AssignTaskModal from "./AssignTaskModal";
import { useAuth } from "../../context/AuthContext";
import { notificationService } from "../../api/notificationsApi";
import { toast } from "react-toastify";

export default function LeaderTopbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [name, setName] = useState("");
  
  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
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

    return () => clearInterval(interval);
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
      case 'task_status_updated':
        navigate('/leader/tasks');
        break;
      case 'task_completed':
        navigate('/leader/tasks');
        break;
      case 'team_member_added':
        navigate('/leader/team');
        break;
      default:
        break;
    }
    
    setIsNotificationOpen(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_status_updated':
        return '🔄';
      case 'task_completed':
        return '✅';
      case 'team_member_added':
        return '👥';
      case 'project_assigned':
        return '📁';
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

  const handleProfileClick = () => {
    navigate("/leader/settings");
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-[#D3D9D4] px-4 md:px-6 flex items-center justify-between sticky top-0 z-[50]">
        
        {/* LEFT SECTION: Brand/Menu */}
        <div className={`items-center gap-2 md:gap-4 ${isMobileSearchOpen ? 'hidden' : 'flex'} min-w-max`}>
          <button 
            onClick={onMenuClick} 
            className="p-2 -ml-2 text-[#235857] md:hidden hover:bg-[#F4F8F8] rounded-xl transition"
            aria-label="Open Menu"
          >
            <Menu size={20} />
          </button>
          
          <div className="leading-tight">
            <p className="text-sm font-semibold text-[#0D2426]">
              Leader Dashboard
            </p>
            <p className="text-xs text-[#6D8B8C] hidden xs:block">
              Manage team and tasks
            </p>
          </div>
        </div>

        {/* CENTER SECTION: Search Bar */}
        <div className={`flex-1 items-center justify-center px-4 ${isMobileSearchOpen ? 'flex absolute inset-0 bg-white z-10 px-6' : 'hidden md:flex'}`}>
          <div className="relative w-full max-w-xl group">
            <Search 
              size={18} 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6D8B8C] group-focus-within:text-[#235857] transition-colors" 
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, projects..."
              className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-[#D3D9D4] text-sm text-[#0D2426] focus:outline-none focus:border-[#235857] focus:ring-2 focus:ring-[#235857]/20 transition-all"
            />
            <button 
              onClick={() => setIsMobileSearchOpen(false)}
              className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 text-[#6D8B8C]"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* RIGHT SECTION: Actions */}
        <div className={`flex items-center gap-2 md:gap-3 ml-auto ${isMobileSearchOpen ? 'hidden' : 'flex'}`}>
          
          {/* Mobile Search Toggle */}
          <button 
            onClick={() => setIsMobileSearchOpen(true)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-[#235857] hover:bg-[#F4F8F8] rounded-xl transition"
          >
            <Search size={20} />
          </button>

          {/* ASSIGN TASK BUTTON */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-[#235857] text-white rounded-xl font-semibold text-xs shadow-sm hover:bg-[#1a4342] transition-all active:scale-95"
          >
            <Plus size={16} /> 
            <span className="hidden lg:inline">Assign Task</span>
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
                {notifications.length > 0 && (
                  <div className="px-4 py-2 border-t border-[#F4F8F8] bg-[#F4F8F8]">
                    <button
                      onClick={() => {
                        navigate('/leader/notifications');
                        setIsNotificationOpen(false);
                      }}
                      className="w-full text-xs text-[#235857] hover:text-[#1a4443] font-medium py-1"
                    >
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-[#D3D9D4] mx-1 hidden xs:block"></div>

          {/* User Profile */}
          <button 
            onClick={handleProfileClick} 
            className="flex items-center gap-2 md:gap-3 pl-1 pr-1 md:pr-2 py-1.5 rounded-xl hover:bg-[#F4F8F8] transition-colors group"
          >
            <div className="text-right hidden md:block leading-tight">
              <p className="text-sm font-semibold text-[#0D2426]">{name || "Leader"}</p>
              <p className="text-xs text-[#6D8B8C]">Team Lead</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#235857] text-white flex items-center justify-center font-semibold text-sm shrink-0">
              {name?.charAt(0) || "L"}
            </div>
          </button>
        </div>
      </header>

      <AssignTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}