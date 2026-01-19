"use client"

import { toast as sonnerToast } from "sonner"

export type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export const toast = ({ title, description, variant }: ToastProps) => {
  if (variant === "destructive") {
    return sonnerToast.error(title, {
      description,
    })
  }
  return sonnerToast(title, {
    description,
  })
}

export function useToast() {
  return {
    toast,
    dismiss: (id?: string | number) => sonnerToast.dismiss(id),
  }
}
