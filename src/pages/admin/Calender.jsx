

import React, { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameDay,
  parseISO,
} from "date-fns";
import { Trash2, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "react-toastify";
import { getAllProjects } from "../../api/projectApi";

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [customTasks, setCustomTasks] = useState({});
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data from API
  useEffect(() => {
    fetchProjects();
    loadCustomTasks();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await getAllProjects();
      setProjects(response.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const loadCustomTasks = () => {
    const savedTasks = localStorage.getItem("adminCustomTasks");
    if (savedTasks) {
      try {
        setCustomTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error("Error loading custom tasks:", error);
      }
    }
  };

  const saveCustomTasks = (updatedTasks) => {
    localStorage.setItem("adminCustomTasks", JSON.stringify(updatedTasks));
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayIndex = getDay(monthStart);

  const addTask = (day) => {
    const projectsOnDay = getProjectsOnDay(day);
    
    if (projectsOnDay.length > 0) {
      setSelectedDate(day);
      return;
    }

    const title = prompt("Enter task title:");
    if (!title || !title.trim()) return;

    const key = format(day, "yyyy-MM-dd");
    const time = format(new Date(), "hh:mm a");

    const updatedTasks = {
      ...customTasks,
      [key]: [...(customTasks[key] || []), { title: title.trim(), time }],
    };

    setCustomTasks(updatedTasks);
    saveCustomTasks(updatedTasks);
    setSelectedDate(day);
    toast.success("Task added successfully!");
  };

  // All custom tasks flattened
  const allCustomTasks = Object.entries(customTasks).flatMap(([date, items]) =>
    items.map((task, index) => ({
      ...task,
      date,
      index,
    }))
  );

  // Remove custom task
  const removeCustomTask = (taskDate, taskIndex) => {
    const updatedTasks = { ...customTasks };
    updatedTasks[taskDate].splice(taskIndex, 1);
    if (updatedTasks[taskDate].length === 0) delete updatedTasks[taskDate];
    
    setCustomTasks(updatedTasks);
    saveCustomTasks(updatedTasks);
    toast.success("Task removed");
  };

  // Get projects on a specific day
  const getProjectsOnDay = (day) => {
    return projects.filter(
      (project) => project.deadline && isSameDay(parseISO(project.deadline), day)
    );
  };

  // Get custom tasks on a specific day
  const getCustomTasksOnDay = (day) => {
    const key = format(day, "yyyy-MM-dd");
    return customTasks[key] || [];
  };

  // Get upcoming projects
  const upcomingProjects = projects
    .filter(p => new Date(p.deadline) >= new Date())
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#235857] mx-auto"></div>
          <p className="mt-4 text-[#6b8f8b]">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div className="flex items-center gap-3">
          <CalendarIcon size={24} className="text-[#235857]" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <p className="text-sm text-gray-500">
              {projects.length} projects · {allCustomTasks.length} custom tasks
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="px-4 py-2 rounded-xl bg-white shadow hover:bg-gray-50 text-sm font-medium transition"
          >
            ← Previous
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-4 py-2 rounded-xl bg-[#235857] text-white shadow hover:bg-[#1c4a48] text-sm font-medium transition"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="px-4 py-2 rounded-xl bg-white shadow hover:bg-gray-50 text-sm font-medium transition"
          >
            Next →
          </button>
        </div>
      </div>

      {/* CALENDAR */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm overflow-x-auto">
        {/* Day headers */}
        <div className="grid grid-cols-7 text-center text-xs sm:text-sm font-semibold text-gray-600 mb-3 pb-2 border-b">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {/* Empty cells for alignment */}
          {Array.from({ length: startDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Days */}
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const customTasksToday = getCustomTasksOnDay(day);
            const projectsToday = getProjectsOnDay(day);
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);

            // Determine background
            let bgClass = "border-gray-200 hover:border-gray-300";
            let textClass = "text-gray-700";
            
            if (isToday) {
              bgClass = "border-blue-500 bg-blue-50";
              textClass = "text-blue-700 font-bold";
            }
            
            // Project deadlines in red
            if (projectsToday.length > 0) {
              bgClass = "border-red-500 bg-red-50";
              textClass = "text-red-700 font-bold";
            }
            
            if (isSelected && !isToday && projectsToday.length === 0) {
              bgClass = "border-[#235857] bg-[#eaf4f3]";
            }

            return (
              <div
                key={key}
                onClick={() => addTask(day)}
                className={`min-h-[80px] sm:min-h-[100px] rounded-xl border-2 p-2
                flex flex-col justify-start items-start 
                cursor-pointer overflow-hidden transition-all hover:shadow-md ${bgClass}`}
              >
                <span className={`text-sm sm:text-base font-medium mb-1 ${textClass}`}>
                  {format(day, "d")}
                </span>

                {/* Project deadlines */}
                {projectsToday.length > 0 && (
                  <div className="space-y-1 w-full">
                    {projectsToday.slice(0, 2).map((p, idx) => (
                      <div 
                        key={idx}
                        className="text-[10px] sm:text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded truncate"
                        title={p.name}
                      >
                        📌 {p.name}
                      </div>
                    ))}
                    {projectsToday.length > 2 && (
                      <div className="text-[10px] text-red-500">
                        +{projectsToday.length - 2} more
                      </div>
                    )}
                  </div>
                )}

                {/* Custom tasks indicator */}
                {customTasksToday.length > 0 && projectsToday.length === 0 && (
                  <div className="text-[10px] sm:text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                    {customTasksToday.length} task{customTasksToday.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SELECTED DATE DETAILS */}
      {selectedDate && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <CalendarIcon size={20} className="text-[#235857]" />
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </h3>

          {/* Project deadlines on selected date */}
          {getProjectsOnDay(selectedDate).length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-red-600 mb-3">
                Project Deadlines ({getProjectsOnDay(selectedDate).length})
              </h4>
              <div className="space-y-2">
                {getProjectsOnDay(selectedDate).map((project) => (
                  <div
                    key={project._id}
                    className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 mb-1">{project.name}</p>
                      <p className="text-xs text-gray-600">
                        Leader: {project.leader?.name || "Not assigned"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Domain: {project.domain} · Status: {project.status}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-red-600 bg-red-100 px-3 py-1 rounded-full ml-4">
                      Deadline
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom tasks on selected date */}
          {getCustomTasksOnDay(selectedDate).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-blue-600 mb-3">
                Custom Tasks ({getCustomTasksOnDay(selectedDate).length})
              </h4>
              <div className="space-y-2">
                {getCustomTasksOnDay(selectedDate).map((task, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{task.title}</p>
                      <p className="text-xs text-gray-600">Added at {task.time}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCustomTask(format(selectedDate, "yyyy-MM-dd"), idx);
                      }}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {getProjectsOnDay(selectedDate).length === 0 && 
           getCustomTasksOnDay(selectedDate).length === 0 && (
            <p className="text-gray-400 text-center py-8">
              No events on this date. Click on the date to add a custom task.
            </p>
          )}
        </div>
      )}

      {/* ALL UPCOMING EVENTS */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
        <h3 className="font-semibold text-lg mb-4">All Upcoming Events</h3>

        {/* Upcoming project deadlines */}
        {upcomingProjects.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-600 mb-3">
              Project Deadlines ({upcomingProjects.length})
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {upcomingProjects.slice(0, 10).map((project) => (
                <div
                  key={project._id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div>
                    <p className="font-medium text-gray-800">{project.name}</p>
                    <p className="text-xs text-gray-500">
                      {project.leader?.name || "No leader"} · {project.domain} · {project.status}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-red-600">
                    {format(new Date(project.deadline), "MMM d, yyyy")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All custom tasks */}
        {allCustomTasks.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-3">
              Custom Tasks ({allCustomTasks.length})
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {allCustomTasks
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((task, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{task.title}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(task.date), "MMM d, yyyy")} • {task.time}
                      </p>
                    </div>
                    <button
                      onClick={() => removeCustomTask(task.date, task.index)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {upcomingProjects.length === 0 && allCustomTasks.length === 0 && (
          <p className="text-gray-400 text-center py-8">
            No upcoming events. Click on any date to add tasks.
          </p>
        )}
      </div>
    </div>
  );
};

export default Calendar;