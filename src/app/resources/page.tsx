"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Workflow, Download, Cpu, Users, Play, BookOpen } from "lucide-react";

export default function ResourcesPage() {
  const [architecture, setArchitecture] = useState<string>("");
  const [workflow, setWorkflow] = useState<string>("");
  const [technology, setTechnology] = useState<string>("");
  const [roles, setRoles] = useState<string>("");
  const [glossary, setGlossary] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/docs/architecture.md").then((r) => r.text()),
      fetch("/docs/workflow.md").then((r) => r.text()),
      fetch("/docs/technology.md").then((r) => r.text()),
      fetch("/docs/roles.md").then((r) => r.text()),
      fetch("/docs/glossary.md").then((r) => r.text()),
    ])
      .then(([arch, wf, tech, rls, gl]) => {
        setArchitecture(arch);
        setWorkflow(wf);
        setTechnology(tech);
        setRoles(rls);
        setGlossary(gl);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <AppShell><div className="flex items-center justify-center h-64 text-muted-foreground">Loading documents...</div></AppShell>;
  }

  const renderMarkdown = (md: string) => {
    const lines = md.split("\n");
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeContent = "";

    lines.forEach((line, i) => {
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${i}`} className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 my-4 overflow-x-auto">
              <code className="text-sm text-zinc-100">{codeContent.trim()}</code>
            </pre>
          );
          codeContent = "";
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeContent += line + "\n";
        return;
      }

      if (line.startsWith("# ")) {
        elements.push(<h1 key={i} className="text-3xl font-bold mt-8 mb-4 text-foreground">{line.slice(2)}</h1>);
      } else if (line.startsWith("## ")) {
        elements.push(<h2 key={i} className="text-2xl font-bold mt-6 mb-3 text-foreground">{line.slice(3)}</h2>);
      } else if (line.startsWith("### ")) {
        elements.push(<h3 key={i} className="text-xl font-bold mt-5 mb-2 text-foreground">{line.slice(4)}</h3>);
      } else if (line.startsWith("#### ")) {
        elements.push(<h4 key={i} className="text-lg font-bold mt-4 mb-2 text-foreground">{line.slice(5)}</h4>);
      }
      else if (line.startsWith("---")) {
        elements.push(<hr key={i} className="my-6 border-zinc-700" />);
      }
      else if (line.startsWith("> ")) {
        elements.push(
          <blockquote key={i} className="border-l-4 border-indigo-500 pl-4 my-4 text-sm text-muted-foreground italic">
            {line.slice(2).replace(/\*\*/g, "").replace(/`/g, "")}
          </blockquote>
        );
      }
      else if (line.includes("|") && line.trim().startsWith("|")) {
        if (line.match(/^\|[\s-|]+$/)) return;
        const cells = line.split("|").filter(c => c.trim()).map(c => c.trim());
        if (cells.length > 0) {
          elements.push(
            <div key={i} className="grid grid-cols-4 gap-2 bg-zinc-800/50 rounded px-3 py-2 mb-1 text-xs">
              {cells.map((cell, j) => (
                <span key={j} className="font-semibold text-foreground">{cell}</span>
              ))}
            </div>
          );
        }
      }
      else if (line.match(/^[-*]\s/)) {
        elements.push(
          <li key={i} className="ml-4 text-sm text-muted-foreground list-disc">
            {line.slice(2).replace(/\*\*/g, "").replace(/`/g, "")}
          </li>
        );
      }
      else if (line.match(/^\d+\.\s/)) {
        elements.push(
          <li key={i} className="ml-4 text-sm text-muted-foreground list-decimal">
            {line.replace(/^\d+\.\s/, "").replace(/\*\*/g, "").replace(/`/g, "")}
          </li>
        );
      }
      else if (line.trim()) {
        elements.push(
          <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-3">
            {line.replace(/\*\*/g, "").replace(/`/g, "")}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <a href="/dashboard" className="text-[10px] md:text-xs text-muted-foreground hover:text-foreground transition-colors">&larr; Back to Dashboard</a>
          <h1 className="text-lg md:text-2xl font-bold">Resources</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Architecture, workflow, technology, roles, and SAFe video references</p>
        </div>

        <Tabs defaultValue="glossary" className="w-full">
          <TabsList className="grid w-full grid-cols-6 h-8 md:h-10">
            <TabsTrigger value="glossary" className="flex items-center gap-1 md:gap-2 text-[8px] md:text-xs">
              <BookOpen className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden md:inline">Glossary</span>
              <span className="md:hidden">Terms</span>
            </TabsTrigger>
            <TabsTrigger value="architecture" className="flex items-center gap-1 md:gap-2 text-[8px] md:text-xs">
              <FileText className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden md:inline">Architecture</span>
              <span className="md:hidden">Arch</span>
            </TabsTrigger>
            <TabsTrigger value="workflow" className="flex items-center gap-1 md:gap-2 text-[8px] md:text-xs">
              <Workflow className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden md:inline">Workflow</span>
              <span className="md:hidden">Work</span>
            </TabsTrigger>
            <TabsTrigger value="technology" className="flex items-center gap-1 md:gap-2 text-[8px] md:text-xs">
              <Cpu className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden md:inline">Technology</span>
              <span className="md:hidden">Tech</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-1 md:gap-2 text-[8px] md:text-xs">
              <Users className="h-3 w-3 md:h-4 md:w-4" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-1 md:gap-2 text-[8px] md:text-xs">
              <Play className="h-3 w-3 md:h-4 md:w-4" />
              Videos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="glossary" className="mt-2 md:mt-4">
            <Card>
              <CardHeader className="pb-2 md:pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-violet-400" />
                    <CardTitle className="text-xs md:text-sm">SAFe & PI Planning — Key Terms & Learning</CardTitle>
                  </div>
                  <a href="/docs/glossary.md" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[9px] md:text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Download className="h-2.5 w-2.5 md:h-3 md:w-3" />
                    <span className="hidden md:inline">Download</span>
                  </a>
                </div>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none p-2 md:p-4">
                {renderMarkdown(glossary)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="architecture" className="mt-2 md:mt-4">
            <Card>
              <CardHeader className="pb-2 md:pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <FileText className="h-4 w-4 md:h-5 md:w-5 text-indigo-400" />
                    <CardTitle className="text-xs md:text-sm">Architecture Document</CardTitle>
                  </div>
                  <a href="/docs/architecture.md" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[9px] md:text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Download className="h-2.5 w-2.5 md:h-3 md:w-3" />
                    <span className="hidden md:inline">Download</span>
                  </a>
                </div>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none p-2 md:p-4">
                {renderMarkdown(architecture)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflow" className="mt-2 md:mt-4">
            <Card>
              <CardHeader className="pb-2 md:pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <Workflow className="h-4 w-4 md:h-5 md:w-5 text-emerald-400" />
                    <CardTitle className="text-xs md:text-sm">Workflow Guide</CardTitle>
                  </div>
                  <a href="/docs/workflow.md" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[9px] md:text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Download className="h-2.5 w-2.5 md:h-3 md:w-3" />
                    <span className="hidden md:inline">Download</span>
                  </a>
                </div>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none p-2 md:p-4">
                {renderMarkdown(workflow)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technology" className="mt-2 md:mt-4">
            <Card>
              <CardHeader className="pb-2 md:pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <Cpu className="h-4 w-4 md:h-5 md:w-5 text-amber-400" />
                    <CardTitle className="text-xs md:text-sm">Technology Choices</CardTitle>
                  </div>
                  <a href="/docs/technology.md" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[9px] md:text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Download className="h-2.5 w-2.5 md:h-3 md:w-3" />
                    <span className="hidden md:inline">Download</span>
                  </a>
                </div>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none p-2 md:p-4">
                {renderMarkdown(technology)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="mt-2 md:mt-4">
            <Card>
              <CardHeader className="pb-2 md:pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <Users className="h-4 w-4 md:h-5 md:w-5 text-cyan-400" />
                    <CardTitle className="text-xs md:text-sm">Role-Based Features Guide</CardTitle>
                  </div>
                  <a href="/docs/roles.md" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[9px] md:text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Download className="h-2.5 w-2.5 md:h-3 md:w-3" />
                    <span className="hidden md:inline">Download</span>
                  </a>
                </div>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none p-2 md:p-4">
                {renderMarkdown(roles)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos" className="mt-2 md:mt-4">
            <Card>
              <CardHeader className="pb-2 md:pb-3">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Play className="h-4 w-4 md:h-5 md:w-5 text-red-400" />
                  <CardTitle className="text-xs md:text-sm">SAFe PI Planning — Video Series</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-2 md:p-4 space-y-4">
                <p className="text-xs md:text-sm text-muted-foreground">
                  In-depth video walkthrough of SAFe PI Planning — from prep work through execution and inspect & adapt.
                </p>
                <div className="rounded-lg border border-zinc-700 overflow-hidden">
                  <iframe
                    src="https://www.youtube.com/embed/videoseries?list=PLE6XrAXqINHl2nVs4Tl3K0hRN1vh-Od7Q"
                    className="w-full"
                    style={{ height: "calc(100vh - 300px)", minHeight: "400px" }}
                    title="SAFe PI Planning Video Series"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <a
                  href="https://www.youtube.com/watch?v=DlL9IkQZRM8&list=PLE6XrAXqINHl2nVs4Tl3K0hRN1vh-Od7Q"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs md:text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  <Play className="h-3 w-3" />
                  Open full playlist on YouTube
                </a>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
