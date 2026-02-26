import { useCallback, useRef } from "react";

interface Action {
  execute: () => void | Promise<void>;
  undo: () => void | Promise<void>;
}

export function useUndoRedo() {
  const history = useRef<Action[]>([]);
  const cursor = useRef(-1);

  const pushAction = useCallback((action: Action) => {
    // Trim future history if we branched
    history.current = history.current.slice(0, cursor.current + 1);
    history.current.push(action);
    if (history.current.length > 50) history.current.shift();
    cursor.current = history.current.length - 1;
  }, []);

  const undo = useCallback(async () => {
    if (cursor.current < 0) return;
    const action = history.current[cursor.current];
    cursor.current -= 1;
    await action.undo();
  }, []);

  const redo = useCallback(async () => {
    if (cursor.current >= history.current.length - 1) return;
    cursor.current += 1;
    const action = history.current[cursor.current];
    await action.execute();
  }, []);

  const canUndo = () => cursor.current >= 0;
  const canRedo = () => cursor.current < history.current.length - 1;

  return { pushAction, undo, redo, canUndo, canRedo };
}
