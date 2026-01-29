import { useEffect, useState } from "react";
import { getMyTasks } from "../../api/taskApi";
import { getMyProjects } from "../../api/projectApi";
import { toast } from 'react-toastify';

import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Briefcase, 
  StickyNote, 
  FolderKanban,
  Clock
} from "lucide-react";

export default function LeaderCalendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  
  // Set today as default selected date so it's visible on load
  const initialDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const [selectedDate, setSelectedDate] = useState(initialDateStr);
  
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch tasks
      const tasksResponse = await getMyTasks();
      console.log('Tasks Response:', tasksResponse);
      
      // Fetch projects
      const projectsResponse = await getMyProjects();
      console.log('Projects Response:', projectsResponse);
      
      if (tasksResponse.success && tasksResponse.tasks) {
        setTasks(tasksResponse.tasks);
      }
      
      if (projectsResponse.success && projectsResponse.projects) {
        setProjects(projectsResponse.projects);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthName = new Date(currentYear, currentMonth).toLocaleString("en-US", { month: "long" });

  const getLocalDateString = (day) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  // Helper function to convert date to local date string (YYYY-MM-DD)
  const formatDateToLocal = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  // Get all deadlines for a date (tasks from API)
  const getDeadlinesForDate = (dateStr) => {
    const apiTasks = tasks
      .filter((task) => formatDateToLocal(task.dueDate) === dateStr)
      .map((task) => ({
        id: task._id,
        title: task.title,
        project: task.project.name,
        description: task.description,
        priority: task.priority,
        status: task.status,
        startDate: task.startDate,
        dueDate: task.dueDate,
        departments: task.departments,
        assignedBy: task.assignedBy.name,
      }));
    
    return apiTasks;
  };

  // Get all project deadlines for a date
  const getProjectDeadlinesForDate = (dateStr) => {
    const projectDeadlines = projects
      .filter((project) => formatDateToLocal(project.deadline) === dateStr)
      .map((project) => ({
        id: project._id,
        name: project.name,
        description: project.description,
        domain: project.domain,
        status: project.status,
        deadline: project.deadline,
        createdAt: project.createdAt,
      }));
    
    return projectDeadlines;
  };

  // Check if a date has any deadlines (tasks or projects)
  const hasDeadlines = (dateStr) => {
    const hasTasks = tasks.some((task) => formatDateToLocal(task.dueDate) === dateStr);
    const hasProjects = projects.some((project) => formatDateToLocal(project.deadline) === dateStr);
    return hasTasks || hasProjects;
  };

  const getNotesForDate = (dateStr) => notes.filter((n) => n.date === dateStr);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  const addNote = () => {
    if (!noteText.trim() || !selectedDate) return;
    setNotes((prev) => [...prev, { id: Date.now(), date: selectedDate, text: noteText }]);
    setNoteText("");
  };

  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'active':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6 animate-in fade-in duration-500">
      
      {/* Heading */}
      <div className="pt-0 flex flex-col md:flex-row md:items-center justify-between pb-2">
        <div>
          <h1 className="text-xl font-semibold text-[#0D2426]">Project Monitoring Summary</h1>
          <p className="text-xs text-[#6D8B8C]">Comprehensive oversight of organizational delivery and risk</p>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between bg-white px-5 py-3 rounded-xl border border-[#D3D9D4] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-[#F4F8F8] rounded-lg text-[#235857]">
            <CalendarIcon size={18} />
          </div>
          <h2 className="text-base font-semibold text-[#0D2426]">
            {monthName} <span className="text-[#6D8B8C] font-normal">{currentYear}</span>
          </h2>
        </div>

        <div className="flex gap-1.5">
          <button onClick={prevMonth} className="p-1.5 rounded-lg bg-white hover:bg-[#F4F8F8] border border-[#D3D9D4] text-[#235857] transition-all">
            <ChevronLeft size={18} />
          </button>
          <button onClick={nextMonth} className="p-1.5 rounded-lg bg-white hover:bg-[#F4F8F8] border border-[#D3D9D4] text-[#235857] transition-all">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D3D9D4]">
        <div className="grid grid-cols-7 text-[10px] font-bold uppercase tracking-widest text-[#6D8B8C] mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {[...Array(firstDay)].map((_, i) => <div key={i} />)}
          {[...Array(daysInMonth)].map((_, index) => {
            const day = index + 1;
            const dateStr = getLocalDateString(day);
            const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
            const isSelected = selectedDate === dateStr;
            const hasDeadline = hasDeadlines(dateStr);

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={`h-14 sm:h-16 rounded-xl border text-sm flex flex-col items-center justify-center relative transition-all
                  ${isToday && !isSelected ? "border-[#235857] bg-[#EAF4F3] text-[#235857] font-bold" : "border-transparent"}
                  ${isSelected ? "!bg-[#235857] !border-[#235857] !text-white shadow-md z-10" : "hover:bg-[#F4F8F8] text-[#0D2426]"}
                `}
              >
                <span className="text-sm font-semibold">{day}</span>
                {hasDeadline && (
                  <span className={`w-1 h-1 rounded-full mt-1 ${isSelected ? "bg-white" : "bg-[#235857]"}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed View */}
      {selectedDate && (
        <div className="bg-[#F4F8F8]/50 rounded-2xl p-6 border border-[#D3D9D4] space-y-6 animate-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tasks Column */}
            <div>
              <h4 className="text-xs font-bold text-[#235857] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Briefcase size={14} /> Task Deadlines
              </h4>
              <div className="space-y-2">
                {loading ? (
                  <p className="text-xs text-[#6D8B8C] italic">Loading tasks...</p>
                ) : getDeadlinesForDate(selectedDate).length === 0 ? (
                  <p className="text-xs text-[#6D8B8C] italic">No tasks scheduled.</p>
                ) : (
                  getDeadlinesForDate(selectedDate).map((d) => (
                    <div key={d.id} className="p-3 bg-white rounded-xl border border-[#D3D9D4] space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#0D2426]">{d.title}</p>
                          <p className="text-[10px] text-[#6D8B8C] uppercase mt-0.5">{d.project}</p>
                        </div>
                        {d.priority && (
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${getPriorityColor(d.priority)}`}>
                            {d.priority}
                          </span>
                        )}
                      </div>
                      
                      {d.description && (
                        <p className="text-xs text-[#355E5A] mt-1">{d.description}</p>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2">
                        {d.status && (
                          <span className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full border ${getStatusColor(d.status)}`}>
                            {d.status}
                          </span>
                        )}
                        {d.departments && d.departments.length > 0 && (
                          <span className="text-[9px] text-[#6D8B8C]">
                            {d.departments.join(', ')}
                          </span>
                        )}
                      </div>
                      
                      {d.assignedBy && (
                        <p className="text-[10px] text-[#6D8B8C] mt-1">
                          Assigned by: <span className="font-medium">{d.assignedBy}</span>
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Projects Column */}
            <div>
              <h4 className="text-xs font-bold text-[#235857] uppercase tracking-wider mb-4 flex items-center gap-2">
                <FolderKanban size={14} /> Project Deadlines
              </h4>
              <div className="space-y-2">
                {loading ? (
                  <p className="text-xs text-[#6D8B8C] italic">Loading projects...</p>
                ) : getProjectDeadlinesForDate(selectedDate).length === 0 ? (
                  <p className="text-xs text-[#6D8B8C] italic">No project deadlines.</p>
                ) : (
                  getProjectDeadlinesForDate(selectedDate).map((project) => (
                    <div key={project.id} className="p-3 bg-white rounded-xl border border-[#D3D9D4] space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#0D2426]">{project.name}</p>
                          <p className="text-[10px] text-[#6D8B8C] uppercase mt-0.5">{project.domain}</p>
                        </div>
                        {project.status && (
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                        )}
                      </div>
                      
                      {project.description && (
                        <p className="text-xs text-[#355E5A] mt-1">{project.description}</p>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Clock size={10} className="text-[#6D8B8C]" />
                        <span className="text-[9px] text-[#6D8B8C]">
                          Created: {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Personal Log Column */}
            <div>
              <h4 className="text-xs font-bold text-[#235857] uppercase tracking-wider mb-4 flex items-center gap-2">
                <StickyNote size={14} /> Personal Log
              </h4>
              <div className="space-y-3">
                {getNotesForDate(selectedDate).map((n) => (
                  <div key={n.id} className="p-2.5 bg-white rounded-lg text-xs text-[#355E5A] border border-[#D3D9D4]/50">
                    {n.text}
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addNote()}
                    placeholder="Add observation..."
                    className="flex-1 bg-white rounded-lg border border-[#D3D9D4] px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#235857]/20"
                  />
                  <button 
                    onClick={addNote} 
                    className="px-3 py-1.5 rounded-lg bg-[#235857] text-white text-xs hover:bg-[#1a4342] transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}