import { useState } from "react";
import { Button } from "@/components/ui/button";

type Status = "Not Started" | "In Progress" | "Completed" | "Locked";

type Step = {
  name: string;
  status: Status;
};

const INITIAL_STEPS: Step[] = [
  { name: "Design", status: "Not Started" },
  { name: "Preparation", status: "Locked" },
  { name: "Production", status: "Locked" },
  { name: "Delivery", status: "Locked" },
];

const statusStyles: Record<Status, string> = {
  Completed: "bg-green-100 text-green-700 border-green-300",
  "In Progress": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "Not Started": "bg-white text-foreground border-black/15",
  Locked: "bg-gray-100 text-gray-400 border-gray-200",
};

export default function WorkflowDemo() {
  const [accepted, setAccepted] = useState(false);
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);

  const handleStepClick = (index: number) => {
    const step = steps[index];
    if (step.status !== "Not Started" && step.status !== "In Progress") return;
    setSteps((prev) =>
      prev.map((s, i) => {
        if (i === index) return { ...s, status: "Completed" };
        if (i === index + 1 && s.status === "Locked")
          return { ...s, status: "Not Started" };
        return s;
      }),
    );
  };

  return (
    <div className="bg-background flex-1 py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <header className="mb-10 text-center sm:text-left">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground mb-2">
            Project Workflow
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-foreground mb-2">
            Workflow Demo
          </h1>
          <p className="text-sm text-muted-foreground font-light max-w-xl">
            Accept the project to begin. Complete each step in order to unlock
            the next.
          </p>
        </header>

        {!accepted ? (
          <div
            className="bg-white rounded-2xl border border-black/5 shadow-sm p-10 sm:p-14 text-center"
            data-testid="card-accept"
          >
            <p className="font-serif text-xl text-foreground mb-2">
              A new project is waiting for you
            </p>
            <p className="text-sm text-muted-foreground font-light mb-8">
              Click below to accept it and start the workflow.
            </p>
            <Button
              onClick={() => setAccepted(true)}
              className="rounded-full px-8"
              data-testid="button-accept-project"
            >
              Accept Project
            </Button>
          </div>
        ) : (
          <div
            className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 sm:p-8"
            data-testid="card-workflow"
          >
            <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-2">
              {steps.map((step, i) => {
                const interactive =
                  step.status === "Not Started" ||
                  step.status === "In Progress";
                return (
                  <div
                    key={step.name}
                    className="flex items-center gap-3 sm:gap-4"
                  >
                    <button
                      type="button"
                      onClick={() => handleStepClick(i)}
                      disabled={!interactive}
                      className={`min-w-[150px] flex flex-col items-center gap-2 rounded-xl border px-5 py-5 transition-opacity ${statusStyles[step.status]} ${interactive ? "hover:opacity-90 cursor-pointer" : "cursor-not-allowed"}`}
                      data-testid={`step-${step.name.toLowerCase()}`}
                    >
                      <span className="font-serif text-base">{step.name}</span>
                      <span
                        className="text-[10px] uppercase tracking-[0.18em] font-medium"
                        data-testid={`status-${step.name.toLowerCase()}`}
                      >
                        {step.status}
                      </span>
                    </button>
                    {i < steps.length - 1 && (
                      <span
                        className="text-foreground/40 text-xl select-none"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
