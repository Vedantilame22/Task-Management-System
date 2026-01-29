

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, Clock, AlignLeft, MessageSquare, Plus, ShieldCheck
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getMyTasks, updateTaskStatus, deleteTask, addComment } from "../../api/taskApi";
import { getMyTeam } from "../../api/userApi";
import AssignTaskModal from "../../components/Leader/AssignTaskModal"; 

export default function LeaderTasks() {
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [allTasks, setAllTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    
    // Listen for task creation events
    const handleTaskCreated = () => fetchData();
    window.addEventListener("taskCreated", handleTaskCreated);
    return () => window.removeEventListener("taskCreated", handleTaskCreated);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch tasks
      const tasksResponse = await getMyTasks();
      const transformedTasks = (tasksResponse.tasks || []).map(task => ({
        id: task._id,
        title: task.title,
        description: task.description,
        status: capitalizeStatus(task.status),
        priority: task.priority,
        domain: task.departments?.[0] || task.project?.domain || 'General',
        due: new Date(task.dueDate).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        }),
        dueDate: task.dueDate,
        assignees: task.assignedTo?.map(user => user.name || user.email) || [],
        assigneeIds: task.assignedTo?.map(user => user._id) || [],
        comments: task.comments || [],
        projectName: task.project?.name || 'No Project',
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        rawStatus: task.status
      }));

      setAllTasks(transformedTasks);

      // Fetch team members
      const teamResponse = await getMyTeam();
      setTeamMembers(teamResponse.teamMembers || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const capitalizeStatus = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'blocked': 'Blocked'
    };
    return statusMap[status] || status;
  };

  const uncapitalizeStatus = (status) => {
    const statusMap = {
      'Pending': 'pending',
      'In Progress': 'in-progress',
      'Completed': 'completed',
      'Blocked': 'blocked'
    };
    return statusMap[status] || status.toLowerCase();
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      // Optimistic update
      setAllTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: newStatus, rawStatus: uncapitalizeStatus(newStatus) } : t
      ));
      
      if (selectedTask?.id === taskId) {
        setSelectedTask(prev => ({ ...prev, status: newStatus, rawStatus: uncapitalizeStatus(newStatus) }));
      }

      // API call
      await updateTaskStatus(taskId, uncapitalizeStatus(newStatus));
      toast.success(`Task status updated to ${newStatus}`);
      
      // Refresh
      await fetchData();
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
      await fetchData();
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }

    try {
      setAllTasks(prev => prev.filter(t => t.id !== taskId));
      setSelectedTask(null);

      await deleteTask(taskId);
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      await fetchData();
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedTask) return;

    try {
      await addComment(selectedTask.id, commentText);
      
      toast.success('Comment added successfully');
      setCommentText("");
      
      // Refresh to get updated comments
      await fetchData();
      
      // Update selected task if still open
      const updatedTask = allTasks.find(t => t.id === selectedTask.id);
      if (updatedTask) {
        setSelectedTask(updatedTask);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleTaskCreated = () => {
    setIsAssignModalOpen(false);
    fetchData();
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F6F6F8] font-sans">
      
      {/* MAIN WORKSPACE */}
      <div className="flex-1 p-6 lg:p-8 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-[#0D2426]">Task Details</h1>
            <p className="text-xs text-[#6D8B8C]">Manage operational workflows and team assignments</p>
          </div>
          
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-[10px] font-bold text-[#6D8B8C] uppercase tracking-widest">Active Tasks</p>
              <p className="text-lg font-semibold text-[#235857]">{allTasks.length}</p>
            </div>
            <div className="text-center border-l border-[#D3D9D4] pl-6">
              <p className="text-[10px] font-bold text-[#6D8B8C] uppercase tracking-widest">Live System</p>
              <p className="text-lg font-semibold text-[#235857]">
                {loading ? 'Loading...' : 'Active'}
              </p>
            </div>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#235857] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-[#6D8B8C]">Loading tasks...</p>
            </div>
          </div>
        ) : (
          /* KANBAN BOARD */
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {["Pending", "In Progress", "Completed"].map((col) => (
              <div key={col} className="flex flex-col gap-5 bg-[#F0F2F0]/30 p-5 rounded-[2.5rem] border border-[#D3D9D4]/40">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      col === 'Pending' ? 'bg-amber-400' : 
                      col === 'In Progress' ? 'bg-[#235857]' : 
                      'bg-emerald-500'
                    }`} />
                    <h2 className="text-sm font-semibold text-[#0D2426]">{col}</h2>
                  </div>
                  <span className="text-[10px] font-bold text-[#235857] bg-white border border-[#D3D9D4] px-2 py-0.5 rounded-lg">
                    {allTasks.filter(t => t.status === col).length}
                  </span>
                </div>

                <div className="space-y-4 min-h-[450px]">
                  {allTasks.filter(t => t.status === col).map((task) => (
                    <div 
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="bg-white p-5 rounded-[2rem] border border-[#D3D9D4] shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#235857] transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[9px] font-bold px-2 py-1 bg-[#F4F8F8] text-[#235857] rounded-lg uppercase tracking-widest">
                          {task.domain}
                        </span>
                        <div className="flex -space-x-2">
                          {task.assignees?.slice(0, 3).map((a, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-[#235857] border-2 border-white flex items-center justify-center text-[8px] font-bold text-white uppercase">
                              {a.charAt(0)}
                            </div>
                          ))}
                          {task.assignees?.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-[#6D8B8C] border-2 border-white flex items-center justify-center text-[8px] font-bold text-white">
                              +{task.assignees.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                      <h3 className="text-[13px] font-semibold text-[#0D2426] group-hover:text-[#235857] line-clamp-2">
                        {task.title}
                      </h3>
                      <p className="text-[10px] text-[#6D8B8C] mt-1">{task.projectName}</p>
                      <div className="mt-4 flex items-center gap-1 text-[10px] text-[#6D8B8C] font-medium">
                        <Clock size={12}/> {task.due}
                      </div>
                    </div>
                  ))}
                  
                  {allTasks.filter(t => t.status === col).length === 0 && (
                    <div className="text-center py-12 text-[#6D8B8C] text-xs">
                      No tasks in this column
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR - TEAM & HEALTH */}
      <div className="w-full lg:w-72 bg-white border-l border-[#D3D9D4] p-8 space-y-10 hidden xl:block">
        <section>
          <h3 className="text-[11px] font-bold text-[#0D2426] uppercase tracking-widest mb-6">Execution Team</h3>
          <div className="space-y-4">
            {teamMembers.slice(0, 5).map((member, i) => (
              <div 
                key={i} 
                onClick={() => navigate("/leader/teams")}
                className="flex items-center gap-3 cursor-pointer group hover:bg-[#F4F8F8] p-2 -ml-2 rounded-2xl transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-[#EAF4F3] text-[#235857] flex items-center justify-center text-[10px] font-bold border border-[#D3D9D4] group-hover:bg-[#235857] group-hover:text-white transition-all">
                  {member.name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0D2426] group-hover:text-[#235857]">{member.name}</p>
                  <p className="text-[9px] text-emerald-600 font-bold">In Workspace</p>
                </div>
              </div>
            ))}
            {teamMembers.length === 0 && (
              <p className="text-xs text-[#6D8B8C]">No team members</p>
            )}
          </div>
        </section>

        <section className="p-6 bg-[#F4F8F8] rounded-[2rem] border border-[#D3D9D4]">
          <h3 className="text-[11px] font-bold text-[#235857] uppercase mb-2">System Status</h3>
          <p className="text-[10px] text-[#6D8B8C] leading-relaxed mb-4">
            All project nodes are operational and synced.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#235857]">
            <ShieldCheck size={14}/> Operational
          </div>
        </section>
      </div>

      {/* TASK DETAILS MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0D2426]/70 backdrop-blur-md" onClick={() => setSelectedTask(null)} />
          
          <div className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden max-h-[92vh]">
            {/* Left Side - Details */}
            <div className="flex-1 overflow-y-auto p-8 border-r border-[#F4F8F8]">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1 pr-4">
                  <h2 className="text-2xl font-semibold text-[#0D2426] mb-2">{selectedTask.title}</h2>
                  <p className="text-xs text-[#6D8B8C]">
                    Project: {selectedTask.projectName} · Due: {selectedTask.due}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedTask(null)} 
                  className="p-2 hover:bg-[#F4F8F8] rounded-full transition-colors"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Description */}
              <section className="mb-8">
                <h4 className="text-[11px] font-bold text-[#235857] uppercase mb-3 flex items-center gap-2 tracking-widest">
                  <AlignLeft size={16}/> Description
                </h4>
                <div className="p-5 bg-[#FBFBFC] rounded-[1.5rem] border border-[#D3D9D4] text-sm text-[#355E5A] leading-relaxed">
                  {selectedTask.description || 'No description provided'}
                </div>
              </section>

              {/* Comments Section */}
              <section>
                <h4 className="text-[11px] font-bold text-[#235857] uppercase mb-4 flex items-center gap-2 tracking-widest">
                  <MessageSquare size={16}/> Activity Stream
                </h4>
                
                {/* Existing Comments */}
                {selectedTask.comments && selectedTask.comments.length > 0 && (
                  <div className="mb-4 space-y-3 max-h-60 overflow-y-auto">
                    {selectedTask.comments.map((comment, idx) => (
                      <div key={idx} className="p-3 bg-white border border-[#D3D9D4] rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-[#0D2426]">
                            {comment.user?.name || 'Team Member'}
                          </span>
                          <span className="text-[9px] text-[#6D8B8C]">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-[#355E5A]">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment */}
                <div className="space-y-3">
                  <textarea 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Type a comment to the team..."
                    className="w-full bg-[#FBFBFC] border border-[#D3D9D4] rounded-[1.5rem] p-4 text-sm outline-none focus:border-[#235857] min-h-[120px] resize-none"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    className="px-6 py-2 bg-[#235857] text-white rounded-xl text-xs font-semibold hover:bg-[#1a4443] disabled:bg-[#D3D9D4] disabled:cursor-not-allowed transition-all"
                  >
                    Add Comment
                  </button>
                </div>
              </section>
            </div>

            {/* Right Side - Actions */}
            <div className="w-full lg:w-80 bg-[#FBFBFC] p-8 space-y-6">
              <div>
                <h4 className="text-[11px] font-bold text-[#0D2426] uppercase tracking-widest mb-4">Personnel Assigned</h4>
                <div className="space-y-3">
                  {selectedTask.assignees && selectedTask.assignees.length > 0 ? (
                    selectedTask.assignees.map((member, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#D3D9D4]">
                        <div className="w-7 h-7 rounded-full bg-[#235857] text-white flex items-center justify-center text-[9px] font-bold">
                          {member.charAt(0)}
                        </div>
                        <span className="text-xs font-semibold text-[#0D2426]">{member}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#6D8B8C]">No assignees</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-[#6D8B8C] uppercase tracking-widest mb-2 block">
                    Task Status
                  </label>
                  <select 
                    value={selectedTask.status}
                    onChange={(e) => handleStatusUpdate(selectedTask.id, e.target.value)}
                    className="w-full bg-white border border-[#D3D9D4] rounded-xl py-3 px-4 text-xs font-semibold text-[#235857] cursor-pointer shadow-sm"
                  >
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                    <option>Blocked</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#6D8B8C] uppercase tracking-widest mb-2 block">
                    Priority
                  </label>
                  <div className={`px-4 py-3 rounded-xl text-xs font-bold uppercase text-center ${
                    selectedTask.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    selectedTask.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    selectedTask.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedTask.priority || 'Medium'}
                  </div>
                </div>

                <button 
                  onClick={() => handleDeleteTask(selectedTask.id)} 
                  className="w-full py-4 bg-white border border-[#D3D9D4] text-rose-600 rounded-2xl text-xs font-semibold hover:bg-rose-50 transition-all"
                >
                  Terminate Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING PLUS BUTTON */}
      <button 
        onClick={() => setIsAssignModalOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#235857] text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
      >
        <Plus size={24} />
      </button>

      {/* ASSIGN TASK MODAL */}
      <AssignTaskModal 
        isOpen={isAssignModalOpen} 
        onClose={() => setIsAssignModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
}