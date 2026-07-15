"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Workflow, Download, Cpu, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ResourcesPage() {
  const [architecture, setArchitecture] = useState<string>("");
  const [workflow, setWorkflow] = useState<string>("");
  const [technology, setTechnology] = useState<string>("");
  const [roles, setRoles] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/docs/architecture.md").then((r) => r.text()),
      fetch("/docs/workflow.md").then((r) => r.text()),
      fetch("/docs/technology.md").then((r) => r.text()),
      fetch("/docs/roles.md").then((r) => r.text()),
    ])
      .then(([arch, wf, tech, rls]) => {
        setArchitecture(arch);
        setWorkflow(wf);
        setTechnology(tech);
        setRoles(rls);
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
      // Code blocks
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

      // Headers
      if (line.startsWith("# ")) {
        elements.push(<h1 key={i} className="text-3xl font-bold mt-8 mb-4 text-foreground">{line.slice(2)}</h1>);
      } else if (line.startsWith("## ")) {
        elements.push(<h2 key={i} className="text-2xl font-bold mt-6 mb-3 text-foreground">{line.slice(3)}</h2>);
      } else if (line.startsWith("### ")) {
        elements.push(<h3 key={i} className="text-xl font-bold mt-5 mb-2 text-foreground">{line.slice(4)}</h3>);
      } else if (line.startsWith("#### ")) {
        elements.push(<h4 key={i} className="text-lg font-bold mt-4 mb-2 text-foreground">{line.slice(5)}</h4>);
      }
      // Horizontal rule
      else if (line.startsWith("---")) {
        elements.push(<hr key={i} className="my-6 border-zinc-700" />);
      }
      // Blockquotes
      else if (line.startsWith("> ")) {
        elements.push(
          <blockquote key={i} className="border-l-4 border-indigo-500 pl-4 my-4 text-sm text-muted-foreground italic">
            {line.slice(2).replace(/\*\*/g, "").replace(/`/g, "")}
          </blockquote>
        );
      }
      // Tables
      else if (line.includes("|") && line.trim().startsWith("|")) {
        // Skip table separator lines
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
      // Lists
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
      // Regular paragraphs
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
          <h1 className="text-2xl font-bold">Resources</h1>
          <p className="text-muted-foreground">Architecture documentation, workflow guides, and technology choices</p>
        </div>

        <Tabs defaultValue="architecture" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="architecture" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Architecture
            </TabsTrigger>
            <TabsTrigger value="workflow" className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              Workflow
            </TabsTrigger>
            <TabsTrigger value="technology" className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Technology
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Roles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="architecture" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-400" />
                    <CardTitle>Architecture Document</CardTitle>
                  </div>
                  <a
                    href="/docs/architecture.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </a>
                </div>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                {renderMarkdown(architecture)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflow" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Workflow className="h-5 w-5 text-emerald-400" />
                    <CardTitle>Workflow Guide</CardTitle>
                  </div>
                  <a
                    href="/docs/workflow.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </a>
                </div>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                {renderMarkdown(workflow)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technology" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-amber-400" />
                    <CardTitle>Technology Choices</CardTitle>
                  </div>
                  <a
                    href="/docs/technology.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </a>
                </div>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                {renderMarkdown(technology)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-cyan-400" />
                    <CardTitle>Role-Based Features Guide</CardTitle>
                  </div>
                  <a
                    href="/docs/roles.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </a>
                </div>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                {renderMarkdown(roles)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
