import {cn} from "@/lib/utils"
import * as React from "react"

interface KeyboardKeyProps extends React.HTMLAttributes<HTMLSpanElement> {
    children: React.ReactNode
    variant?: "default" | "modifier" | "arrow" | "function"
    size?: "sm" | "default" | "lg"
}

export function KeyboardKey({
    children,
    variant = "default",
    size = "default",
    className,
    ...props
}: KeyboardKeyProps) {
    return (
        <span
            className={cn(
                // Base key styling - realistic mechanical keyboard appearance
                "inline-flex items-center justify-center font-mono font-bold tracking-wide",
                "relative transform transition-all duration-150 ease-in-out",
                "select-none cursor-default",

                // 3D mechanical key effect with proper shadows and gradients
                "bg-gradient-to-b shadow-lg",
                "border-2 border-t-1 border-l-1 border-r-2 border-b-3",
                "rounded-lg",

                // Inner shadow for depth and texture
                "before:content-[''] before:absolute before:inset-1 before:rounded-md",
                "before:bg-gradient-to-b before:from-white/20 before:to-transparent",
                "before:pointer-events-none",

                // Hover effects for realistic key press
                "hover:translate-y-[1px] hover:shadow-md active:translate-y-[2px] active:shadow-sm",
                "active:before:from-black/10",

                // Size variants with proper proportions
                size === "sm" && "px-2 py-1 text-xs min-w-[1.75rem] h-7",
                size === "default" && "px-2.5 py-1.5 text-sm min-w-[2.25rem] h-8",
                size === "lg" && "px-3 py-2 text-base min-w-[2.75rem] h-9",

                // Default key styling (light gray keycap)
                variant === "default" && [
                    "from-gray-50 via-gray-100 to-gray-200",
                    "dark:from-gray-600 dark:via-gray-700 dark:to-gray-800",
                    "border-gray-200 border-t-gray-100 border-l-gray-100",
                    "border-r-gray-300 border-b-gray-400",
                    "dark:border-gray-700 dark:border-t-gray-600 dark:border-l-gray-600",
                    "dark:border-r-gray-800 dark:border-b-gray-900",
                    "text-gray-700 dark:text-gray-200",
                    "shadow-gray-300/50 dark:shadow-gray-900/50",
                ],

                // Modifier keys (blue accent)
                variant === "modifier" && [
                    "from-blue-50 via-blue-100 to-blue-200",
                    "dark:from-blue-700 dark:via-blue-800 dark:to-blue-900",
                    "border-blue-200 border-t-blue-100 border-l-blue-100",
                    "border-r-blue-300 border-b-blue-400",
                    "dark:border-blue-800 dark:border-t-blue-700 dark:border-l-blue-700",
                    "dark:border-r-blue-900 dark:border-b-blue-950",
                    "text-blue-700 dark:text-blue-200",
                    "shadow-blue-300/50 dark:shadow-blue-900/50",
                ],

                // Arrow keys (green accent)
                variant === "arrow" && [
                    "from-green-50 via-green-100 to-green-200",
                    "dark:from-green-700 dark:via-green-800 dark:to-green-900",
                    "border-green-200 border-t-green-100 border-l-green-100",
                    "border-r-green-300 border-b-green-400",
                    "dark:border-green-800 dark:border-t-green-700 dark:border-l-green-700",
                    "dark:border-r-green-900 dark:border-b-green-950",
                    "text-green-700 dark:text-green-200",
                    "shadow-green-300/50 dark:shadow-green-900/50",
                ],

                // Function keys (purple accent)
                variant === "function" && [
                    "from-purple-50 via-purple-100 to-purple-200",
                    "dark:from-purple-700 dark:via-purple-800 dark:to-purple-900",
                    "border-purple-200 border-t-purple-100 border-l-purple-100",
                    "border-r-purple-300 border-b-purple-400",
                    "dark:border-purple-800 dark:border-t-purple-700 dark:border-l-purple-700",
                    "dark:border-r-purple-900 dark:border-b-purple-950",
                    "text-purple-700 dark:text-purple-200",
                    "shadow-purple-300/50 dark:shadow-purple-900/50",
                ],

                className
            )}
            {...props}
        >
            {children}
        </span>
    )
}

// Helper component for complex key combinations
interface KeyCombinationProps {
    keys: string[]
    separator?: string
    className?: string
}

export function KeyCombination({
    keys,
    separator = "+",
    className,
}: KeyCombinationProps) {
    const getKeyVariant = (key: string): KeyboardKeyProps["variant"] => {
        const lowerKey = key.toLowerCase()
        if (["ctrl", "alt", "shift", "meta", "cmd"].includes(lowerKey))
            return "modifier"
        if (["up", "down", "left", "right", "↑", "↓", "←", "→"].includes(lowerKey))
            return "arrow"
        if (key.startsWith("F") && key.length <= 3) return "function"
        return "default"
    }

    const formatKey = (key: string): string => {
        // Convert common key names to more readable formats
        const keyMap: Record<string, string> = {
            ctrl: "Ctrl",
            alt: "Alt",
            shift: "Shift",
            meta: "⌘",
            cmd: "⌘",
            enter: "↵",
            return: "↵",
            space: "Space",
            tab: "Tab",
            esc: "Esc",
            escape: "Esc",
            backspace: "⌫",
            delete: "Del",
            up: "↑",
            down: "↓",
            left: "←",
            right: "→",
            arrowup: "↑",
            arrowdown: "↓",
            arrowleft: "←",
            arrowright: "→",
        }

        return keyMap[key.toLowerCase()] || key
    }

    return (
        <span className={cn("inline-flex items-center gap-1", className)}>
            {keys.map((key, index) => (
                <React.Fragment key={index}>
                    <KeyboardKey variant={getKeyVariant(key)} size="sm">
                        {formatKey(key)}
                    </KeyboardKey>
                    {index < keys.length - 1 && (
                        <span className="text-muted-foreground text-xs mx-0.5">
                            {separator}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </span>
    )
}
