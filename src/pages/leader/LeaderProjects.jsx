

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Clock, Target, CheckCircle2, TrendingUp, Calendar, 
  AlertTriangle, Users, MessageSquare, Zap, Info, ShieldCheck
} from "lucide-react";
import { toast } from "react-toastify";
import { getMyProjects } from "../../api/projectApi";
import { getMyTasks } from "../../api/taskApi";

export default function LeaderProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const projectsResponse = await getMyProjects();
      setProjects(projectsResponse.projects || []);

      const tasksResponse = await getMyTasks();
      setTasks(tasksResponse.tasks || []);

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const ongoing = tasks.filter(t => t.status === 'in-progress').length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const total = tasks.length;
  const avgProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Upcoming deadlines
  const upcomingTasks = tasks
    .filter(t => new Date(t.dueDate) >= new Date() && t.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#235857] mx-auto"></div>
          <p className="mt-4 text-[#6b8f8b]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-[#F6F6F8] min-h-screen pb-24 font-sans">
      
      {/* HEADER */}
      <div className="pt-0 flex flex-col md:flex-row md:items-center justify-between pb-2">
        <div>
          <h1 className="text-xl font-semibold text-[#0D2426]">Project Monitoring Summary</h1>
          <p className="text-xs text-[#6D8B8C]">Comprehensive oversight of organizational delivery and risk</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#235857] bg-[#EAF4F3] px-3 py-1 rounded-full uppercase tracking-wider">
            <ShieldCheck size={12} /> Live System Active
          </span>
        </div>
      </div>

      {/* PORTFOLIO PROGRESS & RISK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#D3D9D4] shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-[#0D2426] flex items-center gap-2">
              <TrendingUp size={18} className="text-[#235857]" /> Portfolio Performance
            </h3>
          </div>
          <div className="flex items-end gap-4 mb-2">
            <span className="text-4xl font-bold text-[#0D2426]">{avgProgress}%</span>
            <span className="text-sm text-[#235857] font-medium mb-1">Efficiency Rate</span>
          </div>
          <div className="w-full h-3 bg-[#F0F7F6] rounded-full overflow-hidden mb-6">
            <div className="h-full bg-[#235857] rounded-full transition-all duration-1000" style={{ width: `${avgProgress}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-4 border-t border-[#F4F8F8] pt-6">
            <div>
              <p className="text-[10px] uppercase font-bold text-[#6D8B8C] tracking-wider">Active Tasks</p>
              <p className="text-lg font-semibold text-[#0D2426]">{ongoing}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#6D8B8C] tracking-wider">Completed</p>
              <p className="text-lg font-semibold text-[#0D2426]">{completed}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#6D8B8C] tracking-wider">Total Tasks</p>
              <p className="text-lg font-semibold text-[#0D2426]">{total}</p>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-white p-6 rounded-3xl border border-[#D3D9D4] shadow-sm">
          <h3 className="font-semibold text-[#0D2426] mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" /> Risk Assessment
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-amber-50 rounded-2xl border border-amber-100">
              <span className="text-sm font-medium text-[#0D2426]">Technical Debt</span>
              <span className="text-[10px] font-bold uppercase text-amber-600">Medium</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
              <span className="text-sm font-medium text-[#0D2426]">Schedule Slip</span>
              <span className="text-[10px] font-bold uppercase text-emerald-600">Low Risk</span>
            </div>
            <div className={`flex justify-between items-center p-3 rounded-2xl border ${
              avgProgress < 50 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'
            }`}>
              <span className="text-sm font-medium text-[#0D2426]">Resource Load</span>
              <span className={`text-[10px] font-bold uppercase ${
                avgProgress < 50 ? 'text-rose-600' : 'text-emerald-600'
              }`}>
                {avgProgress < 50 ? 'Critical' : 'Normal'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MILESTONES & CAPACITY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Delivery Milestones */}
        <div className="bg-white p-6 rounded-3xl border border-[#D3D9D4]">
          <h3 className="font-semibold text-[#0D2426] mb-4 flex items-center gap-2">
            <Zap size={18} className="text-[#235857]" /> Delivery Milestones
          </h3>
          <div className="space-y-3">
            {upcomingTasks.map((task, idx) => (
              <div 
                key={task._id} 
                onClick={() => navigate("/leader/tasks")}
                className="flex items-center gap-4 p-3 bg-[#FBFBFC] rounded-2xl border border-[#F0F0F2] cursor-pointer hover:border-[#235857] hover:bg-[#EAF4F3] group transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EAF4F3] group-hover:bg-[#235857] group-hover:text-white flex items-center justify-center text-[#235857] font-bold text-xs transition-colors">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#0D2426] group-hover:text-[#235857] transition-colors">
                    {task.title}
                  </p>
                  <p className="text-[10px] text-[#6D8B8C] uppercase font-bold">
                    {task.project?.name || 'No project'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#0D2426]">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-bold">Details &rarr;</p>
                </div>
              </div>
            ))}
            {upcomingTasks.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No upcoming milestones</p>
            )}
          </div>
        </div>

        {/* Team Capacity */}
        <div className="bg-white p-6 rounded-3xl border border-[#D3D9D4]">
          <h3 className="font-semibold text-[#0D2426] mb-4 flex items-center gap-2">
            <Users size={18} className="text-[#235857]" /> Utilization Index
          </h3>
          <div className="space-y-5">
            {[
              { team: "Engineering Team", load: Math.min((ongoing / 10) * 100, 100) },
              { team: "Product & Design", load: Math.min((completed / 10) * 100, 100) },
              { team: "Quality Assurance", load: Math.min((total / 20) * 100, 100) }
            ].map((item) => (
              <div key={item.team} className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#0D2426]">{item.team}</span>
                  <span className="text-[#6D8B8C]">{Math.round(item.load)}% Load</span>
                </div>
                <div className="h-2 bg-[#F4F8F8] rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${
                      item.load > 80 ? 'bg-amber-500' : 'bg-[#235857]'
                    }`} 
                    style={{ width: `${item.load}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategic Notes */}
      <div className="bg-white p-6 rounded-3xl border border-[#D3D9D4] shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={18} className="text-[#235857]" />
          <h3 className="font-semibold text-[#0D2426]">Strategic Observations</h3>
        </div>
        <div className="p-4 bg-[#F4F8F8] rounded-2xl border-l-4 border-[#235857]">
          <p className="text-sm text-[#355E5A] italic leading-relaxed">
            "Project health is currently {avgProgress > 70 ? 'excellent' : avgProgress > 50 ? 'stable' : 'needs attention'}. 
            {" "}Total {total} tasks with {completed} completed. 
            {" "}{ongoing > 0 ? `${ongoing} tasks actively in progress.` : 'All tasks pending review.'}"
          </p>
          <p className="mt-3 text-[10px] font-bold text-[#6D8B8C] uppercase tracking-widest">
            — Management Note · {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

    </div>
  );
}