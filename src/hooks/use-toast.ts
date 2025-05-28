
import * as React from "react";

const TOAST_LIMIT = 100;
const TOAST_REMOVE_DELAY = 2000;

type ToasterToast = {
  id: string;
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
};

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
const listeners: Array<(state: ToasterToast[]) => void> = [];
let memoryState: ToasterToast[] = [];

function dispatch(state: ToasterToast[]) {
  memoryState = state;
  listeners.forEach((listener) => {
    listener(state);
  });
}

function addToRemoveQueue(toastId: string) {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch(memoryState.filter((toast) => toast.id !== toastId));
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
}

export function toast({
  title,
  description,
  action,
  variant,
}: Omit<ToasterToast, "id">) {
  const id = genId();
  const toast = { id, title, description, action, variant };
  dispatch([...memoryState, toast]);
  return id;
}

toast.dismiss = (toastId?: string) => {
  if (toastId) {
    addToRemoveQueue(toastId);
  } else {
    for (const id of memoryState.map((toast) => toast.id)) {
      addToRemoveQueue(id);
    }
  }
};

export function useToast() {
  const [state, setState] = React.useState<ToasterToast[]>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    toasts: state,
    toast,
    dismiss: toast.dismiss,
  };
}
