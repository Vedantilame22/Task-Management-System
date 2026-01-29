import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getMyTasks, updateTaskStatus } from "../../api/taskApi";
import { Loader2, RefreshCw } from "lucide-react";

export default function Tasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState({
    pending: [],
    inProgress: [],
    completed: [],
  });
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await getMyTasks();
      
      if (response.success && response.tasks) {
        const categorized = categorizeTasks(response.tasks);
        setTasks(categorized);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const categorizeTasks = (taskList) => {
    const categorized = {
      pending: [],
      inProgress: [],
      completed: [],
    };

    taskList.forEach((task) => {
      const status = task.status.toLowerCase();
      
      if (status === 'pending') {
        categorized.pending.push(task);
      } else if (status === 'in-progress' || status === 'in progress') {
        categorized.inProgress.push(task);
      } else if (status === 'completed') {
        categorized.completed.push(task);
      }
    });

    return categorized;
  };

  /* =========================================================
     STATUS CHANGE HANDLER - WITH API INTEGRATION
     ========================================================= */
  const handleStatusChange = async (fromSection, taskId, newStatus) => {
    try {
      setUpdatingTaskId(taskId);

      // Optimistic update
      setTasks((prev) => {
        let movedTask;

        const updatedFromSection = prev[fromSection].filter((task) => {
          if (task._id === taskId) {
            movedTask = { ...task, status: newStatus };
            return false;
          }
          return true;
        });

        const toSection = getTargetSection(newStatus);

        return {
          ...prev,
          [fromSection]: updatedFromSection,
          [toSection]: [...prev[toSection], movedTask],
        };
      });

      // API call to update status
      const response = await updateTaskStatus(taskId, newStatus);

      if (response.success) {
        toast.success(`Task status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status");
      
      // Revert on error
      fetchTasks();
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const getTargetSection = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending') return 'pending';
    if (statusLower === 'in-progress' || statusLower === 'in progress') return 'inProgress';
    if (statusLower === 'completed') return 'completed';
    return 'pending';
  };

  const getStatusForAPI = (displayStatus) => {
    switch (displayStatus) {
      case 'Pending':
        return 'pending';
      case 'In Progress':
        return 'in-progress';
      case 'Completed':
        return 'completed';
      default:
        return 'pending';
    }
  };

  /* =========================================================
     FORMAT DATE
     ========================================================= */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  /* =========================================================
     TASK SECTION COMPONENT
     ========================================================= */
  const Section = ({ title, color, sectionKey }) => (
    <div className="mb-10">
      <div
        className="rounded-xl p-4 sm:p-6 shadow-lg bg-white"
        style={{ borderLeft: `6px solid ${color}` }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-[#235857]">
            {title}
          </h2>
          <span className="text-sm font-bold text-[#6D8B8C] bg-[#F4F8F8] px-3 py-1 rounded-full">
            {tasks[sectionKey].length}
          </span>
        </div>

        {tasks[sectionKey].length === 0 ? (
          <div className="text-center py-12 text-[#6D8B8C]">
            <p className="text-sm">No tasks in this section</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tasks[sectionKey].map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                sectionKey={sectionKey}
                onStatusChange={handleStatusChange}
                isUpdating={updatingTaskId === task._id}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* =========================================================
     MAIN UI
     ========================================================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#235857] mx-auto mb-4" />
          <p className="text-sm text-[#6D8B8C]">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-[#D3D9D4]/30 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0D2426]">
            Task overview
          </h1>
          <p className="text-[#6D8B8C]">
            Review and manage your assigned tasks.
          </p>
        </div>
        
        <button
          onClick={fetchTasks}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D3D9D4] rounded-lg text-[#235857] hover:bg-[#F4F8F8] transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <Section title="Pending tasks" color="#235857" sectionKey="pending" />
      <Section title="In progress" color="#3B8A7F" sectionKey="inProgress" />
      <Section title="Completed tasks" color="#8CBDB3" sectionKey="completed" />
    </div>
  );
}

/* =========================================================
   TASK CARD COMPONENT
   ========================================================= */
function TaskCard({ task, sectionKey, onStatusChange, isUpdating, navigate }) {
  const [selectedStatus, setSelectedStatus] = useState(
    task.status === 'pending' ? 'Pending' :
    task.status === 'in-progress' ? 'In Progress' :
    task.status === 'completed' ? 'Completed' : 'Pending'
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'medium':
        return 'bg-blue-100 text-blue-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleUpdateStatus = async () => {
    const apiStatus = selectedStatus === 'Pending' ? 'pending' :
                     selectedStatus === 'In Progress' ? 'in-progress' :
                     'completed';
    
    await onStatusChange(sectionKey, task._id, apiStatus);
  };

  const handleViewDetails = () => {
    navigate(`/employee/tasks/${task._id}`, {
      state: {
        task: task,
        project: task.project?.name || 'No project',
        title: task.title,
        assignedBy: task.assignedBy,
        assignedTo: task.assignedTo,
      },
    });
  };

  return (
    <div className="rounded-xl border border-[#D3D9D4] bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <h3 className="font-semibold text-[#0D0D0D] text-base sm:text-lg">
          {task.title}
        </h3>

        <div className="flex gap-2 flex-wrap">
          <span
            className={`px-3 py-1 text-xs rounded-full font-medium w-fit ${getPriorityColor(task.priority)}`}
          >
            {task.priority}
          </span>
          <span
            className="px-3 py-1 text-xs rounded-full font-medium w-fit"
            style={{
              background:
                task.status === "completed"
                  ? "#8CBDB3"
                  : task.status === "in-progress"
                  ? "#3B8A7F"
                  : "#D3D9D4",
              color: "#0D2426",
            }}
          >
            {task.status === 'in-progress' ? 'In Progress' : 
             task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </span>
        </div>
      </div>

      <p className="text-sm mt-2 text-[#6D8B8C] font-medium">
        {task.project?.name || 'No project'}
      </p>

      {task.description && (
        <p className="text-sm mt-3 text-[#0D0D0D]/80 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Assigned Info */}
      {task.assignedTo && task.assignedTo.length > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-[#6D8B8C]">Assigned to:</span>
          <div className="flex -space-x-2">
            {task.assignedTo.slice(0, 3).map((member, idx) => (
              <div
                key={idx}
                className="w-6 h-6 rounded-full bg-[#235857] text-white flex items-center justify-center text-[9px] font-bold border-2 border-white"
                title={member.name}
              >
                {member.name?.[0] || 'A'}
              </div>
            ))}
            {task.assignedTo.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-[#6D8B8C] text-white flex items-center justify-center text-[9px] font-bold border-2 border-white">
                +{task.assignedTo.length - 3}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-[#F4F8F8]">
        <div className="flex justify-between items-center text-sm text-[#6D8B8C]">
          <span>Start: {formatDate(task.startDate)}</span>
          <span>Due: {formatDate(task.dueDate)}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleViewDetails}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#235857] hover:bg-[#1a4443] transition-all"
          >
            View details
          </button>

          <div className="flex gap-2 flex-1">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              disabled={isUpdating}
              className="flex-1 rounded-lg border border-[#D3D9D4] px-3 py-2 text-sm focus:outline-none focus:border-[#235857] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>

            <button
              onClick={handleUpdateStatus}
              disabled={isUpdating || selectedStatus === (
                task.status === 'pending' ? 'Pending' :
                task.status === 'in-progress' ? 'In Progress' :
                'Completed'
              )}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#3B8A7F] text-white hover:bg-[#2d6b62] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUpdating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span className="hidden sm:inline">Updating...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={14} />
                  <span className="hidden sm:inline">Update</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}