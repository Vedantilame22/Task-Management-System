import { useState, useEffect } from "react";
import { getMyTasks } from "../../api/taskApi";
import { getMyProjects } from "../../api/projectApi";
import { toast } from 'react-toastify';

const initialNotes = [];

export default function Calendar() {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);

  const [notes, setNotes] = useState(initialNotes);
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

  const monthName = new Date(currentYear, currentMonth).toLocaleString(
    "en-US",
    { month: "long" },
  );

  /* ================= HELPERS ================= */
  const getLocalDateString = (day) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(
      day,
    ).padStart(2, "0")}`;

  // Helper function to convert date to local date string (YYYY-MM-DD)
  const formatDateToLocal = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  // Get task deadlines for a date
  const getTaskDeadlinesForDate = (dateStr) => {
    return tasks
      .filter((task) => formatDateToLocal(task.dueDate) === dateStr)
      .map((task) => ({
        id: task._id,
        title: task.title,
        project: task.project.name,
        description: task.description,
        priority: task.priority,
        status: task.status,
        assignedBy: task.assignedBy.name,
      }));
  };

  // Get project deadlines for a date
  const getProjectDeadlinesForDate = (dateStr) => {
    return projects
      .filter((project) => formatDateToLocal(project.deadline) === dateStr)
      .map((project) => ({
        id: project._id,
        title: project.name,
        project: project.domain,
        description: project.description,
        status: project.status,
      }));
  };

  // Get all deadlines (tasks + projects) for a date
  const getDeadlinesForDate = (dateStr) => {
    const taskDeadlines = getTaskDeadlinesForDate(dateStr);
    const projectDeadlines = getProjectDeadlinesForDate(dateStr);
    return [...taskDeadlines, ...projectDeadlines];
  };

  const getNotesForDate = (dateStr) => notes.filter((n) => n.date === dateStr);

  /* ================= NAVIGATION ================= */
  const prevMonth = () => {
    setSelectedDate(null);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };

  const nextMonth = () => {
    setSelectedDate(null);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  /* ================= ADD NOTE ================= */
  const addNote = () => {
    if (!noteText.trim() || !selectedDate) return;

    setNotes((prev) => [
      ...prev,
      { id: Date.now(), date: selectedDate, text: noteText },
    ]);
    setNoteText("");
  };

  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return '';
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-gray-100 text-gray-700';
      case 'active':
        return 'bg-blue-100 text-blue-700';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-semibold text-[#0D2426]">
          {monthName} {currentYear}
        </h2>

        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="px-3 py-1 rounded-lg bg-[#D3D9D4]/60 hover:bg-[#D3D9D4]"
          >
            ◀
          </button>
          <button
            onClick={nextMonth}
            className="px-3 py-1 rounded-lg bg-[#D3D9D4]/60 hover:bg-[#D3D9D4]"
          >
            ▶
          </button>
        </div>
      </div>

      {/* ================= CALENDAR ================= */}
      <div className="bg-white rounded-2xl p-3 sm:p-6 shadow-sm">
        {/* Week Days */}
        <div className="grid grid-cols-7 text-[11px] sm:text-sm text-[#6D8B8C] mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center font-medium">
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {[...Array(firstDay)].map((_, i) => (
            <div key={i} />
          ))}

          {[...Array(daysInMonth)].map((_, index) => {
            const day = index + 1;
            const dateStr = getLocalDateString(day);

            const isToday =
              day === today.getDate() &&
              currentMonth === today.getMonth() &&
              currentYear === today.getFullYear();

            const hasDeadline = getDeadlinesForDate(dateStr).length > 0;
            const hasNote = getNotesForDate(dateStr).length > 0;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={`
                  aspect-square
                  rounded-lg sm:rounded-xl
                  border text-[11px] sm:text-sm
                  flex items-center justify-center
                  relative transition
                  ${
                    isToday
                      ? "border-[#235857] text-[#235857] font-semibold"
                      : "border-[#D3D9D4] text-[#0D2426]"
                  }
                  hover:bg-[#3B8A7F]/10
                `}
              >
                {day}

                {hasDeadline && (
                  <span
                    className="absolute bottom-1 left-1/2 -translate-x-1/2
                                   w-1.5 h-1.5 rounded-full bg-[#235857]"
                  />
                )}

                {hasNote && (
                  <span
                    className="absolute bottom-1 right-1.5
                                   w-1.5 h-1.5 rounded-full bg-[#8CBDB3]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= DATE DETAILS ================= */}
      {selectedDate && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm space-y-6">
          <h3 className="font-semibold text-[#0D2426] text-sm sm:text-base">
            {new Date(selectedDate).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h3>

          {/* Deadlines */}
          <div>
            <h4 className="text-sm font-medium text-[#235857] mb-2">
              Task & Project Deadlines
            </h4>

            {loading ? (
              <p className="text-sm text-[#6D8B8C]">Loading...</p>
            ) : getDeadlinesForDate(selectedDate).length === 0 ? (
              <p className="text-sm text-[#6D8B8C]">No task deadlines.</p>
            ) : (
              <ul className="space-y-2">
                {getDeadlinesForDate(selectedDate).map((d) => (
                  <li
                    key={d.id}
                    className="px-4 py-3 rounded-lg
                               bg-[#3B8A7F]/10
                               border border-[#D3D9D4]/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-[#235857] text-sm font-semibold">
                          {d.title}
                        </p>
                        <span className="block text-xs text-[#6D8B8C] mt-0.5">
                          {d.project}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {d.priority && (
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${getPriorityColor(d.priority)}`}>
                            {d.priority}
                          </span>
                        )}
                        {d.status && (
                          <span className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full ${getStatusColor(d.status)}`}>
                            {d.status}
                          </span>
                        )}
                      </div>
                    </div>
                    {d.description && (
                      <p className="text-xs text-[#355E5A] mt-2">
                        {d.description}
                      </p>
                    )}
                    {d.assignedBy && (
                      <p className="text-[10px] text-[#6D8B8C] mt-1">
                        Assigned by: <span className="font-medium">{d.assignedBy}</span>
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Notes */}
          <div>
            <h4 className="text-sm font-medium text-[#235857] mb-2">
              Personal notes
            </h4>

            {getNotesForDate(selectedDate).length === 0 ? (
              <p className="text-sm text-[#6D8B8C]">No notes added.</p>
            ) : (
              <ul className="space-y-2 mb-3">
                {getNotesForDate(selectedDate).map((n) => (
                  <li
                    key={n.id}
                    className="px-4 py-2 rounded-lg
                               bg-[#D3D9D4]/40 text-sm"
                  >
                    {n.text}
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addNote()}
                placeholder="Add a personal note"
                className="flex-1 rounded-lg border border-[#D3D9D4]
                           px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#235857]/20"
              />
              <button
                onClick={addNote}
                className="px-4 py-2 rounded-lg
                           bg-[#235857] text-white text-sm hover:bg-[#1a4342] transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}