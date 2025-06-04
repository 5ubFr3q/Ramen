import {Badge} from "@/components/ui/badge"
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {KeyboardKey, KeyCombination} from "@/components/ui/keyboard-key"

interface HelpDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

interface KeyBinding {
    key: string
    description: string
    mode?: "normal" | "insert" | "global"
}

export function HelpDialog({open, onOpenChange}: HelpDialogProps) {
    const keyBindings: KeyBinding[] = [
        // Global shortcuts
        {key: "Ctrl+B", description: "Toggle sidebar", mode: "global"},
        {key: "?", description: "Show help (this dialog)", mode: "global"},

        // Normal mode shortcuts
        {key: "h", description: "Move selection left", mode: "normal"},
        {key: "j", description: "Move selection down", mode: "normal"},
        {key: "k", description: "Move selection up", mode: "normal"},
        {key: "l", description: "Move selection right", mode: "normal"},
        {key: "a", description: "Enter insert mode", mode: "normal"},
        {key: "d", description: "Delete selected node", mode: "normal"},

        // Insert mode shortcuts
        {key: "Esc", description: "Return to normal mode", mode: "insert"},
    ]

    const globalBindings = keyBindings.filter((kb) => kb.mode === "global")
    const normalBindings = keyBindings.filter((kb) => kb.mode === "normal")
    const insertBindings = keyBindings.filter((kb) => kb.mode === "insert")

    const renderKey = (keyString: string) => {
        // Handle key combinations (e.g., "Ctrl+B")
        if (keyString.includes("+")) {
            const keys = keyString.split("+")
            return <KeyCombination keys={keys} />
        }

        // Handle single keys
        return <KeyboardKey>{keyString}</KeyboardKey>
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Keyboard Shortcuts
                        <Badge variant="outline">Help</Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Global shortcuts */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-gray-900">
                            Global Shortcuts
                        </h3>
                        <div className="space-y-2">
                            {globalBindings.map((binding) => (
                                <div
                                    key={binding.key}
                                    className="flex items-center justify-between py-2"
                                >
                                    <span className="text-sm text-gray-700">
                                        {binding.description}
                                    </span>
                                    {renderKey(binding.key)}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Normal mode shortcuts */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
                            Normal Mode
                            <Badge variant="default">NORMAL</Badge>
                        </h3>
                        <div className="space-y-2">
                            {normalBindings.map((binding) => (
                                <div
                                    key={binding.key}
                                    className="flex items-center justify-between py-2"
                                >
                                    <span className="text-sm text-gray-700">
                                        {binding.description}
                                    </span>
                                    {renderKey(binding.key)}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Insert mode shortcuts */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
                            Insert Mode
                            <Badge variant="secondary">INSERT</Badge>
                        </h3>
                        <div className="space-y-2">
                            {insertBindings.map((binding) => (
                                <div
                                    key={binding.key}
                                    className="flex items-center justify-between py-2"
                                >
                                    <span className="text-sm text-gray-700">
                                        {binding.description}
                                    </span>
                                    {renderKey(binding.key)}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Additional info */}
                    <div className="border-t pt-4">
                        <p className="text-sm text-gray-500">
                            Press <KeyboardKey size="sm">?</KeyboardKey> at any time to
                            open this help dialog.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
