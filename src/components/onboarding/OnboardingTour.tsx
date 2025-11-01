"use client";

import { useState, useEffect } from "react";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TourStep = {
  title: string;
  description: string;
  target?: string;
  position?: "top" | "bottom" | "left" | "right";
};

const tourSteps: TourStep[] = [
  {
    title: "欢迎使用 Story Board! 🎬",
    description:
      "Story Board 是一个强大的时间轴式多帧故事编辑工具。让我们快速了解核心功能。",
  },
  {
    title: "序列时间轴",
    description:
      "左侧是时间轴，显示所有帧和过渡效果。你可以拖拽帧来重新排序。",
    target: "timeline",
    position: "right",
  },
  {
    title: "添加新帧",
    description:
      "点击「+ 添加帧」按钮，可以上传图片或使用 AI 生成新帧。",
    target: "add-frame",
    position: "right",
  },
  {
    title: "编辑面板",
    description:
      "右侧面板包含多个标签页，用于编辑图像、配置过渡效果和预览结果。",
    target: "editor-panel",
    position: "left",
  },
  {
    title: "过渡效果",
    description:
      "在相邻帧之间，你可以添加过渡效果。输入 Prompt 描述过渡动画，AI 会自动生成。",
    target: "transition",
    position: "right",
  },
  {
    title: "键盘快捷键 ⌨️",
    description:
      "使用快捷键提高效率：\n• ↑↓ 选择帧\n• Delete 删除帧\n• Esc 取消选择\n\n现在开始创作吧！",
  },
];

const ONBOARDING_KEY = "story-board:onboarding-completed";

export function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      // Delay showing tour to let page render
      setTimeout(() => setIsOpen(true), 500);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const step = tourSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />

      {/* Tour Card */}
      <div
        className={cn(
          "fixed z-50 w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl",
          !step.target && "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        )}
        style={
          step.target
            ? {
                // Position near target element - simplified for now
                left: step.position === "right" ? "320px" : "auto",
                right: step.position === "left" ? "320px" : "auto",
                top: "120px",
              }
            : undefined
        }
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute right-4 top-4 rounded-lg p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-neutral-900">
              {step.title}
            </h3>
            <p className="mt-2 whitespace-pre-line text-sm text-neutral-600">
              {step.description}
            </p>
          </div>

          {/* Progress indicators */}
          <div className="flex items-center gap-2">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all",
                  index === currentStep
                    ? "bg-primary"
                    : index < currentStep
                    ? "bg-primary/30"
                    : "bg-neutral-200"
                )}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-neutral-500"
            >
              跳过引导
            </Button>
            <div className="flex gap-2">
              {!isFirstStep && (
                <Button variant="outline" onClick={handlePrev}>
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  上一步
                </Button>
              )}
              <Button onClick={handleNext}>
                {isLastStep ? "开始使用" : "下一步"}
                {!isLastStep && <ArrowRight className="ml-1 h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Step counter */}
          <p className="text-center text-xs text-neutral-400">
            {currentStep + 1} / {tourSteps.length}
          </p>
        </div>
      </div>
    </>
  );
}

