import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { 
  getTaskById, 
  updateTask, 
  updateTaskStatus 
} from "../../api/taskApi";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Users, 
  Briefcase,
  AlertCircle,
  Loader2,
  Save,
  RefreshCw
} from "lucide-react";

export default function TaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Editable fields
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedStatus, setEditedStatus] = useState("");
  const [editedPriority, setEditedPriority] = useState("");

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await getTaskById(taskId);
      
      if (response.success && response.task) {
        setTask(response.task);
        setEditedTitle(response.task.title);
        setEditedDescription(response.task.description || "");
        setEditedStatus(response.task.status);
        setEditedPriority(response.task.priority);
      }
    } catch (error) {
      console.error("Error fetching task details:", error);
      toast.error("Failed to load task details");
      
      // Fallback to location state if available
      if (location.state?.task) {
        setTask(location.state.task);
        setEditedTitle(location.state.task.title);
        setEditedDescription(location.state.task.description || "");
        setEditedStatus(location.state.task.status);
        setEditedPriority(location.state.task.priority);
        setLoading(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // const handleUpdateTask = async () => {
  //   try {
  //     setUpdating(true);
      
  //     const updatedData = {
  //       title: editedTitle,
  //       description: editedDescription,
  //       status: editedStatus,
  //       priority: editedPriority,
  //     };

  //     const response = await updateTask(taskId, updatedData);

  //     if (response.success) {
  //       toast.success("Task updated successfully");
  //       setTask(response.task);
  //       setEditMode(false);
  //     }
  //   } catch (error) {
  //     console.error("Error updating task:", error);
  //     toast.error("Failed to update task");
  //   } finally {
  //     setUpdating(false);
  //   }
  // };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      const response = await updateTaskStatus(taskId, newStatus);

      if (response.success) {
        toast.success(`Status updated to ${newStatus}`);
        setTask({ ...task, status: newStatus });
        setEditedStatus(newStatus);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#235857] mx-auto mb-4" />
          <p className="text-sm text-[#6D8B8C]">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#0D2426] mb-2">Task Not Found</h2>
          <p className="text-[#6D8B8C] mb-4">The task you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/employee/tasks")}
            className="px-6 py-2 bg-[#235857] text-white rounded-lg hover:bg-[#1a4443] transition-all"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D3D9D4]/30 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/employee/tasks")}
            className="flex items-center gap-2 text-[#235857] hover:text-[#1a4443] transition-all"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to tasks</span>
          </button>

          {/* <div className="flex gap-2">
            {editMode ? (
              <>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setEditedTitle(task.title);
                    setEditedDescription(task.description || "");
                    setEditedStatus(task.status);
                    setEditedPriority(task.priority);
                  }}
                  disabled={updating}
                  className="px-4 py-2 border border-[#D3D9D4] text-[#6D8B8C] rounded-lg hover:bg-[#F4F8F8] transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateTask}
                  disabled={updating}
                  className="flex items-center gap-2 px-4 py-2 bg-[#235857] text-white rounded-lg hover:bg-[#1a4443] transition-all disabled:opacity-50"
                >
                  {updating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-[#235857] text-white rounded-lg hover:bg-[#1a4443] transition-all"
              >
                Edit Task
              </button>
            )}
          </div> */}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          
          {/* Title Section */}
          <div className="mb-6">
            {editMode ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full text-2xl sm:text-3xl font-bold text-[#0D2426] border-b-2 border-[#D3D9D4] focus:border-[#235857] outline-none pb-2"
              />
            ) : (
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0D2426] mb-2">
                {task.title}
              </h1>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="flex items-center gap-2 px-4 py-2 bg-[#F4F8F8] rounded-lg text-sm font-medium text-[#235857]">
              <Briefcase size={16} />
              {task.project?.name || 'No project'}
            </span>
            
            {editMode ? (
              <>
                <select
                  value={editedPriority}
                  onChange={(e) => setEditedPriority(e.target.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border-2 outline-none ${getPriorityColor(editedPriority)}`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>

                <select
                  value={editedStatus}
                  onChange={(e) => setEditedStatus(e.target.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium outline-none ${getStatusColor(editedStatus)}`}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </>
            ) : (
              <>
                <span className={`px-4 py-2 rounded-lg text-sm font-medium border-2 ${getPriorityColor(task.priority)}`}>
                  Priority: {task.priority}
                </span>
                
                <span className={`px-4 py-2 rounded-lg text-sm font-medium ${getStatusColor(task.status)}`}>
                  {task.status === 'in-progress' ? 'In Progress' : 
                   task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <div className="mb-6 p-6 bg-[#F4F8F8] rounded-xl">
            <h3 className="text-sm font-bold text-[#6D8B8C] uppercase tracking-wider mb-3">
              Description
            </h3>
            {editMode ? (
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                rows="5"
                className="w-full text-[#0D2426] border border-[#D3D9D4] rounded-lg p-3 outline-none focus:border-[#235857] resize-none"
                placeholder="Add task description..."
              />
            ) : (
              <p className="text-[#0D2426] leading-relaxed">
                {task.description || "No description provided."}
              </p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-[#F4F8F8] rounded-xl">
              <div className="flex items-center gap-2 text-[#6D8B8C] mb-2">
                <Calendar size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Start Date</span>
              </div>
              <p className="text-[#0D2426] font-semibold">
                {formatDate(task.startDate)}
              </p>
            </div>

            <div className="p-4 bg-[#F4F8F8] rounded-xl">
              <div className="flex items-center gap-2 text-[#6D8B8C] mb-2">
                <Calendar size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Due Date</span>
              </div>
              <p className="text-[#0D2426] font-semibold">
                {formatDate(task.dueDate)}
              </p>
            </div>
          </div>

          {/* Assigned By */}
          {task.assignedBy && (
            <div className="mb-6 p-4 bg-[#F4F8F8] rounded-xl">
              <div className="flex items-center gap-2 text-[#6D8B8C] mb-3">
                <User size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Assigned By</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#235857] text-white flex items-center justify-center font-bold">
                  {task.assignedBy.name?.[0] || 'A'}
                </div>
                <div>
                  <p className="text-[#0D2426] font-semibold">{task.assignedBy.name}</p>
                  <p className="text-xs text-[#6D8B8C]">{task.assignedBy.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Assigned To */}
          {task.assignedTo && task.assignedTo.length > 0 && (
            <div className="mb-6 p-4 bg-[#F4F8F8] rounded-xl">
              <div className="flex items-center gap-2 text-[#6D8B8C] mb-3">
                <Users size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Assigned To ({task.assignedTo.length})
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {task.assignedTo.map((member, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#235857] text-white flex items-center justify-center text-sm font-bold">
                      {member.name?.[0] || 'A'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0D2426]">{member.name}</p>
                      <p className="text-xs text-[#6D8B8C]">{member.domain || member.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Status Update (when not in edit mode) */}
          {!editMode && (
            <div className="pt-6 border-t border-[#D3D9D4]">
              <h3 className="text-sm font-bold text-[#6D8B8C] uppercase tracking-wider mb-3">
                Quick Status Update
              </h3>
              <div className="flex gap-2">
                {['pending', 'in-progress', 'completed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={updating || task.status === status}
                    className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      task.status === status
                        ? 'bg-[#235857] text-white'
                        : 'bg-[#F4F8F8] text-[#6D8B8C] hover:bg-[#D3D9D4]'
                    }`}
                  >
                    {updating && task.status !== status ? (
                      <Loader2 size={16} className="animate-spin mx-auto" />
                    ) : (
                      status === 'in-progress' ? 'In Progress' :
                      status.charAt(0).toUpperCase() + status.slice(1)
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}