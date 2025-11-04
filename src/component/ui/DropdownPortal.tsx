import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export const DropdownPortal = ({
  children,
  anchorRect,
}: {
  children: React.ReactNode;
  anchorRect: DOMRect;
}) => {
  const [el, setEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    setEl(div);
    return () => {
      document.body.removeChild(div);
    };
  }, []);

  if (!el) return null;

  const style: React.CSSProperties = {
    position: "absolute",
    top: anchorRect.bottom + window.scrollY,
    left: anchorRect.left + window.scrollX,
    zIndex: 9999,
  };

  return createPortal(<div style={style}>{children}</div>, el);
};
