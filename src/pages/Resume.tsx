import React from "react";

const Resume = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-4xl h-[80vh] shadow-lg rounded-lg overflow-hidden border border-border">
        <iframe
          src="/My Resume.pdf"
          title="Resume"
          width="100%"
          height="100%"
          style={{ border: "none" }}
          allow="fullscreen"
        />
      </div>
    </div>
  );
};

export default Resume;
