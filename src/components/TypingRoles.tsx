import { useEffect, useState } from "react";

type TypingRolesProps = {
  roles: string[];
  className?: string;
};

/**
 * Types out each role character-by-character, pauses, deletes, and moves to the
 * next — a classic "AI terminal" flourish for the hero. Falls back to a static
 * first role when the user prefers reduced motion.
 */
const TypingRoles = ({ roles, className }: TypingRolesProps) => {
  const [reduced, setReduced] = useState(false);
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduced || !roles.length) return;

    const current = roles[index % roles.length];
    let timeout: number;

    if (!deleting && text === current) {
      timeout = window.setTimeout(() => setDeleting(true), 1400);
    } else if (deleting && text === "") {
      setDeleting(false);
      setIndex((i) => (i + 1) % roles.length);
    } else {
      timeout = window.setTimeout(
        () => {
          const next = deleting
            ? current.slice(0, text.length - 1)
            : current.slice(0, text.length + 1);
          setText(next);
        },
        deleting ? 45 : 85,
      );
    }

    return () => window.clearTimeout(timeout);
  }, [text, deleting, index, roles, reduced]);

  if (reduced) {
    return <span className={className}>{roles[0]}</span>;
  }

  return (
    <>
      {/* The animated span is decorative — read letter by letter it is noise —
          so assistive tech gets the full list once instead. */}
      <span aria-hidden="true" className={`type-caret ${className ?? ""}`.trim()}>
        {text}
      </span>
      <span className="sr-only">{roles.join(" ")}</span>
    </>
  );
};

export default TypingRoles;
