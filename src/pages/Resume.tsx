import { ArrowLeft, Download } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

// Must match the file actually shipped in public/.
const RESUME_URL = "/resume.pdf";

const Resume = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container flex flex-col gap-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              to="/"
              className="link-underline inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to portfolio
            </Link>
            <h1 className="display-font mt-3 text-3xl font-semibold tracking-tight">
              Resume
            </h1>
          </div>

          <a href={RESUME_URL} download>
            <Button variant="outline" className="rounded-full px-6">
              Download PDF
              <Download className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </a>
        </div>

        <div className="h-[80vh] w-full overflow-hidden rounded-2xl border border-border shadow-sm">
          <iframe
            src={RESUME_URL}
            title="Resume of Lalfakawma Vangchhia"
            width="100%"
            height="100%"
            style={{ border: "none" }}
            allow="fullscreen"
          />
        </div>

        {/* Mobile browsers routinely refuse to render a PDF in an iframe. */}
        <p className="text-center text-sm text-muted-foreground">
          Can&apos;t see the document?{" "}
          <a
            href={RESUME_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline text-foreground"
          >
            Open it in a new tab
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default Resume;
