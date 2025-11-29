"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";
import { useMotionValue, useSpring, useMotionValueEvent } from "framer-motion";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value = 0, ...props }, ref) => {
  const isFirstMount = React.useRef(true);
  const canAnimate = React.useRef(false);
  const animatedValue = useMotionValue(0);
  const spring = useSpring(animatedValue, {
    damping: 25,
    stiffness: 90,
    duration: 1500,
  });
  const [displayValue, setDisplayValue] = React.useState(() => {
    const percentage = Math.max(0, Math.min(100, value || 0));
    return percentage;
  });

  React.useEffect(() => {
    const percentage = Math.max(0, Math.min(100, value || 0));
    if (isFirstMount.current) {
      // En el primer mount, usar requestAnimationFrame para animar después del render
      requestAnimationFrame(() => {
        canAnimate.current = true;
        animatedValue.set(percentage);
      });
      isFirstMount.current = false;
    } else {
      // En actualizaciones posteriores, animar normalmente
      animatedValue.set(percentage);
    }
  }, [animatedValue, value]);

  useMotionValueEvent(spring, "change", (latest) => {
    // Solo actualizar display si podemos animar (evita el parpadeo inicial)
    if (canAnimate.current) {
      setDisplayValue(latest);
    }
  });

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-primary transition-all duration-300 ease-out"
        style={{
          transform: `translateX(-${100 - displayValue}%)`,
        }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };

