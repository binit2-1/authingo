"use client";

import type { SandpackFiles } from "@codesandbox/sandpack-react";
import {
  SandpackCodeEditor,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import { useState } from "react";
import type { PlaygroundSandpackConfig } from "@/lib/playgrounds";

type PlaygroundSandboxProps = {
  sandpackConfig: PlaygroundSandpackConfig;
};

type SandboxView = "code" | "preview";

const hiddenStyleFile = (path: string) => path.endsWith("styles.css");

function withHiddenStyles(files: SandpackFiles): SandpackFiles {
  return Object.fromEntries(
    Object.entries(files).map(([path, file]) => {
      if (!hiddenStyleFile(path)) return [path, file];

      if (typeof file === "string") {
        return [path, { code: file, hidden: true }];
      }

      return [path, { ...file, hidden: true }];
    }),
  );
}

export function PlaygroundSandbox({ sandpackConfig }: PlaygroundSandboxProps) {
  const [view, setView] = useState<SandboxView>("code");
  const files = withHiddenStyles(sandpackConfig.files);
  const visibleFiles = (
    sandpackConfig.visibleFiles ?? Object.keys(files)
  ).filter((path) => !hiddenStyleFile(path));

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <div className="flex h-12 pl-10 shrink-0 border-y border-fd-border">
        {(["code", "preview"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setView(item)}
            className={`h-full w-32 border-x border-fd-border font-pixel text-sm transition-colors sm:w-40 ${
              view === item
                ? "bg-[#0763ee] text-white"
                : "text-fd-foreground hover:bg-fd-muted/10"
            }`}
          >
            {item === "preview" ? "UI" : "Code"}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 px-6 py-5 sm:px-10">
        <div className="authingo-sandbox h-full min-h-0 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 shadow-2xl">
          <SandpackProvider
            template={sandpackConfig.template ?? "react-ts"}
            theme="dark"
            files={files}
            customSetup={{
              ...sandpackConfig.customSetup,
              dependencies: {
                ...sandpackConfig.customSetup?.dependencies,
                "@authingo/react": "latest",
              },
            }}
            options={{
              ...sandpackConfig.options,
              activeFile: sandpackConfig.activeFile ?? visibleFiles[0],
              visibleFiles,
            }}
          >
            {view === "code" ? (
              <SandpackCodeEditor
                className="h-full min-h-0 overflow-auto"
                showTabs
                showLineNumbers
                style={{ height: "100%" }}
              />
            ) : (
              <SandpackPreview
                className="h-full min-h-0 overflow-auto"
                showNavigator={false}
                showOpenInCodeSandbox={false}
                showOpenNewtab={false}
                style={{ height: "100%" }}
              />
            )}
          </SandpackProvider>
        </div>
      </div>

      <style jsx global>{`
        .authingo-sandbox .sp-wrapper,
        .authingo-sandbox .sp-layout,
        .authingo-sandbox .sp-stack,
        .authingo-sandbox .sp-editor,
        .authingo-sandbox .sp-preview {
          height: 100%;
          min-height: 0;
        }

        .authingo-sandbox .sp-editor {
          display: flex;
          flex-direction: column;
        }

        .authingo-sandbox .sp-code-editor {
          min-height: 0;
          flex: 1 1 0;
          overflow: auto;
        }

        .authingo-sandbox .cm-editor {
          height: 100%;
          min-height: 0;
        }

        .authingo-sandbox .cm-scroller {
          overflow: auto;
        }

        .authingo-sandbox .sp-preview iframe {
          height: 100%;
        }
      `}</style>
    </div>
  );
}
