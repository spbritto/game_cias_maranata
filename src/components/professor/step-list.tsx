"use client";

import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, GripVertical, Trash2 } from "lucide-react";
import { StepFields } from "./step-fields";
import { STEP_TYPE_LABELS, stepHeadline } from "@/lib/schemas/step";
import type { StepDraft } from "@/lib/schemas/step-draft";
import { cn } from "@/lib/utils";

export type EditorStep = { id: string; data: StepDraft };

/**
 * Lista de missões: reordenável, colapsável, uma aberta por vez.
 *
 * Só uma aberta de propósito — com seis missões de formulário longo, a tela
 * vira um rolo infinito onde o professor se perde.
 */
export function StepList({
  steps,
  onChange,
  onRemove,
}: {
  steps: EditorStep[];
  onChange: (steps: EditorStep[]) => void;
  onRemove: (id: string) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(steps[0]?.id ?? null);

  const sensors = useSensors(
    // A distância mínima evita que um toque para abrir vire arrasto no celular.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const from = steps.findIndex((s) => s.id === active.id);
    const to = steps.findIndex((s) => s.id === over.id);
    if (from === -1 || to === -1) return;

    onChange(arrayMove(steps, from, to));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={steps.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <ol className="flex flex-col gap-3">
          {steps.map((step, index) => (
            <SortableStep
              key={step.id}
              step={step}
              index={index}
              open={openId === step.id}
              onToggle={() =>
                setOpenId((current) => (current === step.id ? null : step.id))
              }
              onChange={(data) =>
                onChange(
                  steps.map((s) => (s.id === step.id ? { ...s, data } : s)),
                )
              }
              onRemove={() => onRemove(step.id)}
            />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}

function SortableStep({
  step,
  index,
  open,
  onToggle,
  onChange,
  onRemove,
}: {
  step: EditorStep;
  index: number;
  open: boolean;
  onToggle: () => void;
  onChange: (data: StepDraft) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: step.id });

  const headline = stepHeadline(step.data as never) || "";

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "rounded-card border border-line bg-surface-raised",
        isDragging && "relative z-10 border-aurora-400 opacity-90 shadow-xl",
      )}
    >
      <div className="flex items-center gap-1 p-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Reordenar missão ${index + 1}`}
          className="flex size-10 shrink-0 cursor-grab touch-none items-center justify-center rounded-full text-ink-subtle hover:text-ink active:cursor-grabbing"
        >
          <GripVertical aria-hidden className="size-5" />
        </button>

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex min-h-touch flex-1 items-center gap-3 rounded-field px-2 text-left"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-ember-500/30 bg-ember-500/10 text-xs font-semibold text-ember-400">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs text-ink-subtle">
              {STEP_TYPE_LABELS[step.data.type]}
            </span>
            <span className="block truncate text-sm font-medium text-ink">
              {step.data.title.trim() || headline.trim() || "Sem título ainda"}
            </span>
          </span>
          <ChevronDown
            aria-hidden
            className={cn(
              "size-5 shrink-0 text-ink-subtle transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        <button
          type="button"
          onClick={() => {
            if (window.confirm("Remover esta missão do jogo?")) onRemove();
          }}
          aria-label={`Remover missão ${index + 1}`}
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-ink-subtle hover:text-red-300"
        >
          <Trash2 aria-hidden className="size-4" />
        </button>
      </div>

      {open ? (
        <div className="border-t border-line p-4 sm:p-5">
          <StepFields draft={step.data} onChange={onChange} />
        </div>
      ) : null}
    </li>
  );
}
