import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Topbar from "../components/Topbar";

const FACTS = [
  "Role-based task assignment and visibility",
  "Clear task ownership across teams",
  "Structured task lifecycle management",
  "Deadline-driven task tracking",
  "Admin, leader, and employee role separation",
  "Designed for multi-team environments",
  "Consistent workflows across projects",
  "Optimized for daily operational use",
  "Centralized task visibility for all roles",
  "Standardized task status handling",
  "Predictable task progression across stages",
  "Clear separation of responsibility and execution",
  "Task-level accountability enforcement",
  "Calendar-aligned deadline management",
  "Unified task and schedule synchronization",
  "Controlled task updates and modifications",
  "Scalable task architecture for growing teams",
  "Designed for long-term operational stability",
  "Minimal cognitive overhead for daily usage",
  "Structured task metadata management",
  "Consistent task behavior across modules",
  "Clear distinction between active and completed tasks",
  "Support for parallel project execution",
  "Reliable task state consistency",
  "Optimized for cross-functional collaboration",
  "Clear task assignment traceability",
  "Support for task review and completion validation",
  "Predictable navigation between task views",
  "Reduced ambiguity in task execution",
  "Improved visibility into workload distribution",
  "Designed for enterprise-grade workflows",
  "Task handling aligned with organizational hierarchy",
  "Structured execution without unnecessary complexity",
  "Optimized for professional work environments",
  "Reliable deadline visibility for employees",
  "Consistent user experience across task states",
  "Clear task ownership handoff mechanisms",
  "Built for disciplined execution tracking",
  "Supports operational clarity at scale",
  "Focused on execution rather than noise",
  "Designed for accountability-driven teams",
  "Stable task workflows across releases",
  "Aligned with real-world organizational processes",
  "Supports measurable task progress tracking",
];

export default function Landing() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % FACTS.length);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  const visibleFacts = FACTS.slice(index, index + 5);

  return (
    <div className="min-h-screen bg-[#F5F8F7] text-[#0F2F2C]">
      <Topbar />

      {/* ================= HERO ================= */}
      <section
        className="max-w-7xl mx-auto px-6 pt-20 pb-24
                          grid grid-cols-1 lg:grid-cols-2 gap-14 items-start"
      >
        {/* LEFT */}
        <div>
          <h1 className="text-4xl sm:text-5xl font-semibold leading-tight">
            Task management
            <br />
            <span className="text-[#4F6F73] font-medium">
              built for structured execution
            </span>
          </h1>

          <p className="mt-6 text-base text-[#556F73] max-w-xl leading-relaxed">
            Graphura helps teams plan, assign, track, and complete tasks through
            clearly defined workflows that support accountability and execution.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            {/* PRIMARY CTA */}
            <Link
              to="/signup"
              className="
                bg-[#235857] text-white
                px-6 py-3 rounded-xl
                text-sm font-medium
                transition-all duration-200
                hover:bg-[#1F6F68]
                hover:-translate-y-[2px]
                hover:shadow-lg
                active:translate-y-0
              "
            >
              Create workspace
            </Link>

            {/* SECONDARY CTA */}
            <Link
              to="/login"
              className="
                px-6 py-3 rounded-xl
                border border-[#C8D6D3]
                text-sm font-medium text-[#235857]
                transition-all duration-200
                hover:bg-[#E6EFED]
                hover:border-[#235857]
              "
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* RIGHT — PLATFORM CAPABILITIES */}
        <div
          className="
            bg-white rounded-2xl p-8
            border border-[#D0DED9]
            shadow-sm
            transition-all duration-300
            hover:shadow-lg
            hover:border-[#235857]
          "
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-[#235857]">
              Platform capabilities
            </h3>
            <span
              className="text-xs px-3 py-1 rounded-full
                             bg-[#E4EFEC] text-[#235857]"
            >
              Live
            </span>
          </div>

          <ul className="space-y-3 min-h-[160px]">
            {visibleFacts.map((fact, i) => (
              <li
                key={i}
                className="
                  text-sm text-[#355E5A]
                  border-l-4 border-[#7FAFA7]
                  pl-3
                  transition-all duration-200
                  hover:border-[#235857]
                  hover:text-[#0F2F2C]
                  hover:translate-x-[2px]
                "
              >
                {fact}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            title="Role-based access"
            desc="Permissions and visibility are defined by role to ensure responsibility clarity and controlled execution."
          />
          <FeatureCard
            title="Structured workflows"
            desc="Tasks follow defined stages, maintaining consistency from assignment through completion."
          />
          <FeatureCard
            title="Operational readiness"
            desc="Designed to support growing teams, long-term usage, and disciplined task execution."
          />
        </div>
      </section>

      <footer
        className="text-center text-xs text-[#6B8488]
                         py-6 border-t border-[#D0DED9]"
      >
        © 2026 Graphura India Private Limited. All rights reserved.
      </footer>
    </div>
  );
}

function FeatureCard({ title, desc }) {
  return (
    <div
      className="
        bg-white p-8 rounded-2xl
        border border-[#D0DED9]
        shadow-sm
        transition-all duration-300
        hover:-translate-y-1
        hover:shadow-lg
        hover:border-[#235857]
      "
    >
      <h4 className="font-semibold text-base mb-2 text-[#235857]">{title}</h4>
      <p className="text-sm text-[#556F73] leading-relaxed">{desc}</p>
    </div>
  );
}
