import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('es', {
    hour: '2-digit',
    minute: '2-digit'
  })
}