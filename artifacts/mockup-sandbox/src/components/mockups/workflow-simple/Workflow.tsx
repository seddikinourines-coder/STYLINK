import { useState } from "react";

type StepStatus = "Not Started" | "In Progress" | "Completed" | "Locked";

type Step = {
  name: string;
  status: StepStatus;
};

const INITIAL_STEPS: Step[] = [
  { name: "Design", status: "Not Started" },
  { name: "Preparation", status: "Locked" },
  { name: "Production", status: "Locked" },
  { name: "Delivery", status: "Locked" },
];

function statusStyles(status: StepStatus): {
  pill: string;
  ring: string;
  text: string;
  iconBg: string;
} {
  switch (status) {
    case "Completed":
      return {
        pill: "bg-green-100 text-green-700 border-green-200",
        ring: "border-green-500 bg-green-500 text-white",
        text: "text-green-700",
        iconBg: "bg-green-500",
      };
    case "In Progress":
      return {
        pill: "bg-yellow-100 text-yellow-800 border-yellow-200",
        ring: "border-yellow-500 bg-yellow-400 text-white",
        text: "text-yellow-800",
        iconBg: "bg-yellow-400",
      };
    case "Not Started":
      return {
        pill: "bg-white text-gray-700 border-gray-300",
        ring: "border-gray-400 bg-white text-gray-700",
        text: "text-gray-800",
        iconBg: "bg-gray-300",
      };
    case "Locked":
    default:
      return {
        pill: "bg-gray-100 text-gray-400 border-gray-200",
        ring: "border-gray-300 bg-gray-100 text-gray-400",
        text: "text-gray-400",
        iconBg: "bg-gray-200",
      };
  }
}

function StepIcon({ status, index }: { status: StepStatus; index: number }) {
  const s = statusStyles(status);
  if (status === "Completed") {
    return (
      <div
        className={`w-12 h-12 rounded-full ${s.iconBg} flex items-center justify-center text-white shadow-sm`}
        aria-label="completed"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M5 10.5l3 3 7-7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }
  if (status === "Locked") {
    return (
      <div
        className={`w-12 h-12 rounded-full ${s.iconBg} flex items-center justify-center text-gray-400 border border-gray-200`}
        aria-label="locked"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <rect
            x="4.5"
            y="9"
            width="11"
            height="7.5"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M7 9V6.5a3 3 0 0 1 6 0V9"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }
  return (
    <div
      className={`w-12 h-12 rounded-full border-2 ${
        status === "In Progress"
          ? "bg-yellow-400 border-yellow-500 text-white"
          : "bg-white border-gray-400 text-gray-700"
      } flex items-center justify-center font-semibold shadow-sm`}
      aria-label={status}
    >
      {index + 1}
    </div>
  );
}

export default function Workflow() {
  const [accepted, setAccepted] = useState(false);
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);

  const acceptProject = () => setAccepted(true);

  // When the user clicks an active step, mark it Completed and unlock the
  // next step. "Active" means status is "Not Started" or "In Progress".
  const handleStepClick = (index: number) => {
    setSteps((prev) => {
      const step = prev[index];
      if (step.status !== "Not Started" && step.status !== "In Progress") {
        return prev;
      }
      const next = prev.map((s, i) => {
        if (i === index) return { ...s, status: "Completed" as StepStatus };
        if (i === index + 1 && s.status === "Locked") {
          return { ...s, status: "Not Started" as StepStatus };
        }
        return s;
      });
      return next;
    });
  };

  const resetDemo = () => {
    setAccepted(false);
    setSteps(INITIAL_STEPS);
  };

  if (!accepted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-md border border-gray-200 p-8 text-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500 mb-3 font-medium">
            New Project Invitation
          </p>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Summer Collection
          </h1>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            You've been invited to collaborate on this project. Accept to view
            the workflow and start tracking progress.
          </p>
          <button
            type="button"
            onClick={acceptProject}
            className="w-full bg-gray-900 hover:bg-black text-white font-medium py-3 px-6 rounded-full transition-colors shadow-sm"
            data-testid="button-accept-project"
          >
            Accept Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 sm:p-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500 mb-2 font-medium">
              Project Workflow
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              Summer Collection
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Click an active step to mark it completed and unlock the next one.
            </p>
          </div>
          <button
            type="button"
            onClick={resetDemo}
            className="text-xs text-gray-500 hover:text-gray-900 underline underline-offset-4"
            data-testid="button-reset-demo"
          >
            Reset
          </button>
        </div>

        {/* Horizontal step flow */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between gap-2">
            {steps.map((step, i) => {
              const styles = statusStyles(step.status);
              const isClickable =
                step.status === "Not Started" || step.status === "In Progress";
              return (
                <div key={step.name} className="contents">
                  <button
                    type="button"
                    onClick={() => handleStepClick(i)}
                    disabled={!isClickable}
                    className={`flex flex-col items-center gap-2 flex-1 group ${
                      isClickable ? "cursor-pointer" : "cursor-default"
                    }`}
                    data-testid={`step-${step.name.toLowerCase()}`}
                    aria-label={`${step.name} — ${step.status}`}
                  >
                    <div
                      className={`transition-transform ${
                        isClickable ? "group-hover:scale-105" : ""
                      }`}
                    >
                      <StepIcon status={step.status} index={i} />
                    </div>
                    <p
                      className={`text-sm font-medium ${styles.text}`}
                      data-testid={`step-name-${step.name.toLowerCase()}`}
                    >
                      {step.name}
                    </p>
                    <span
                      className={`text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full border ${styles.pill}`}
                      data-testid={`step-status-${step.name.toLowerCase()}`}
                    >
                      {step.status}
                    </span>
                  </button>
                  {i < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 rounded-full mb-12 ${
                        steps[i].status === "Completed"
                          ? "bg-green-400"
                          : "bg-gray-200"
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            Completed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            In Progress
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white border border-gray-400" />
            Not Started
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-200 border border-gray-300" />
            Locked
          </span>
        </div>
      </div>
    </div>
  );
}
