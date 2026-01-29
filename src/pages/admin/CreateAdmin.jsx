

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { createProject, getAllProjects, deleteProject } from "../../api/projectApi";
import { getAllLeaders } from "../../api/userApi";

export default function CreateAdmin() {
  const [projects, setProjects] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    leader: "",
    domain: "",
    deadline: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
    
      const projectsResponse = await getAllProjects();
      setProjects(projectsResponse.projects || []);

      
      const leadersResponse = await getAllLeaders();
      setLeaders(leadersResponse.leaders || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.leader || !formData.deadline) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description || "No description provided",
        leader: formData.leader,
        domain: formData.domain,
        deadline: formData.deadline,
      };

      const response = await createProject(payload);

      if (response.success) {
        toast.success("Project created successfully!");
        
       
        setFormData({
          name: "",
          description: "",
          leader: "",
          domain: "",
          deadline: "",
        });

       
        fetchData();
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error(error.response?.data?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      const response = await deleteProject(projectId);
      
      if (response.success) {
        toast.success("Project deleted successfully");
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error(error.response?.data?.message || "Failed to delete project");
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      {/* Heading */}
      <div className="mb-6 md:mb-10">
        <h1 className="text-3xl font-bold mb-2 text-[#0D2426]">Create Projects & Leaders</h1>
        <p className="text-[#6D8B8C] mb-8">Add and manage projects for your organization</p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-[#d7ebe9] p-4 md:p-8 shadow-sm">
        
        {/* Create Form */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-lg font-semibold text-[#235857] mb-6">Create Project</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <input
              placeholder="Project Name"
              className="w-full p-3 rounded-xl border border-[#d7ebe9] bg-[#eaf4f3] text-sm text-[#235857] focus:outline-none focus:ring-2 focus:ring-[#dff1ef]"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={loading}
            />
            
            <input
              type="text"
              placeholder="Description"
              className="w-full p-3 rounded-xl border border-[#d7ebe9] bg-[#eaf4f3] text-sm text-[#235857] focus:outline-none focus:ring-2 focus:ring-[#dff1ef]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={loading}
            />

            <select
              className="w-full p-3 rounded-xl border border-[#d7ebe9] bg-white text-sm text-[#235857] focus:outline-none"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              disabled={loading}
            >
              <option value="">Select Domain</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Full Stack">Full Stack</option>
              <option value="Mobile">Mobile</option>
              <option value="DevOps">DevOps</option>
              <option value="UI/UX">UI/UX</option>
              <option value="QA/Testing">QA/Testing</option>
              <option value="Data/Analytics">Data/Analytics</option>
              <option value="Database">Database</option>
            </select>

            <select
              className="w-full p-3 rounded-xl border border-[#d7ebe9] bg-white text-sm text-[#235857] focus:outline-none"
              value={formData.leader}
              onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
              disabled={loading}
            >
              <option value="">Select Leader</option>
              {leaders.map((leader) => (
                <option key={leader._id} value={leader._id}>
                  {leader.name} ({leader.domain})
                </option>
              ))}
            </select>

            <input
              type="date"
              className="w-full p-3 rounded-xl border border-[#d7ebe9] bg-[#eaf4f3] text-sm text-[#235857] focus:outline-none"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              disabled={loading}
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#235857] text-white py-3 md:py-0 rounded-xl font-semibold text-sm hover:bg-[#1c4a48] transition active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </div>

        {/* Projects Display */}
        <div>
          <h2 className="text-lg font-semibold text-[#235857] mb-6">
            Projects ({projects.length})
          </h2>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-[#d7ebe9]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#eaf4f3]">
                <tr>
                  <th className="p-4 text-xs font-bold text-[#235857]">Name</th>
                  <th className="p-4 text-xs font-bold text-[#235857]">Domain</th>
                  <th className="p-4 text-xs font-bold text-[#235857]">Leader</th>
                  <th className="p-4 text-xs font-bold text-[#235857]">Deadline</th>
                  <th className="p-4 text-xs font-bold text-[#235857]">Status</th>
                  <th className="p-4 text-xs font-bold text-[#235857] text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d7ebe9]">
                {projects.map((project) => (
                  <tr key={project._id} className="hover:bg-[#eaf4f3]/60 transition-colors">
                    <td className="p-4 text-sm font-medium text-[#235857]">{project.name}</td>
                    <td className="p-4 text-sm text-[#6b8f8b]">{project.domain}</td>
                    <td className="p-4 text-sm text-[#6b8f8b]">
                      {project.leader?.name || "Not assigned"}
                    </td>
                    <td className="p-4 text-sm text-red-500">
                      {new Date(project.deadline).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        project.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : project.status === "active"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(project._id)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#ffe4e4] text-red-600 hover:bg-red-100 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {projects.map((project) => (
              <div key={project._id} className="bg-[#eaf4f3]/40 border border-[#d7ebe9] rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-[#235857]">{project.name}</h3>
                  <span className="text-xs font-bold text-red-500">
                    {new Date(project.deadline).toLocaleDateString('en-US', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </span>
                </div>
                <div className="text-sm text-[#6b8f8b] space-y-1">
                  <p>
                    <span className="font-semibold text-[#235857]">Lead:</span> 
                    {" "}{project.leader?.name || "Not assigned"}
                  </p>
                  <p>
                    <span className="font-semibold text-[#235857]">Domain:</span> 
                    {" "}{project.domain}
                  </p>
                  <p>
                    <span className="font-semibold text-[#235857]">Status:</span> 
                    {" "}{project.status}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(project._id)}
                  className="w-full mt-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold"
                >
                  Delete Project
                </button>
              </div>
            ))}
          </div>

          {projects.length === 0 && (
            <div className="p-10 text-center text-[#6b8f8b] text-sm bg-gray-50 rounded-xl mt-4">
              No projects created yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}