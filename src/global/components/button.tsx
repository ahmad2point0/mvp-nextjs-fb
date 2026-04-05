import {
  Button as ShadcnButton,
  type buttonVariants,
} from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/global/lib/utils";

type ButtonVariant = "primary" | "ghost" | "neutral";

const variantMap: Record<
  ButtonVariant,
  VariantProps<typeof buttonVariants>["variant"]
> = {
  primary: "default",
  ghost: "ghost",
  neutral: "outline",
};

interface ButtonProps extends React.ComponentProps<"button"> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  fullWidth = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <ShadcnButton
      variant={variantMap[variant]}
      className={cn(fullWidth && "w-full", className)}
      {...props}
    >
      {children}
    </ShadcnButton>
  );
}
