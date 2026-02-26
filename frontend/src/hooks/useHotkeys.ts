import { useEffect } from "react";

type Modifier = "ctrl" | "meta" | "shift" | "alt";

interface HotkeyOptions {
  key: string;
  modifiers?: Modifier[];
  handler: (e: KeyboardEvent) => void;
  /** If true, fires even when an input/textarea is focused */
  allowInInput?: boolean;
}

export function useHotkeys(hotkeys: HotkeyOptions[]) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const inInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      for (const hk of hotkeys) {
        if (!hk.allowInInput && inInput) continue;
        if (e.key.toLowerCase() !== hk.key.toLowerCase()) continue;
        const mods = hk.modifiers ?? [];
        if (mods.includes("ctrl") && !e.ctrlKey) continue;
        if (mods.includes("meta") && !e.metaKey) continue;
        if (mods.includes("shift") && !e.shiftKey) continue;
        if (mods.includes("alt") && !e.altKey) continue;
        // Ensure no extra modifiers pressed that aren't expected
        if (!mods.includes("ctrl") && e.ctrlKey) continue;
        if (!mods.includes("meta") && e.metaKey) continue;
        if (!mods.includes("shift") && e.shiftKey) continue;
        if (!mods.includes("alt") && e.altKey) continue;
        e.preventDefault();
        hk.handler(e);
        break;
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [hotkeys]);
}
