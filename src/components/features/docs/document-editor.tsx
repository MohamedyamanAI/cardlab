"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Image02Icon,
  Loading03Icon,
  TextBoldIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  Heading01Icon,
  Heading02Icon,
  Heading03Icon,
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  LeftToRightBlockQuoteIcon,
  CodeIcon,
  MinusSignIcon,
  UndoIcon,
  RedoIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadMedia, getSignedUrl } from "@/lib/actions/media";
import { updateDocument } from "@/lib/actions/documents";
import type { Document, Project } from "@/lib/types";
import type { Editor } from "@tiptap/react";
import type { IconSvgElement } from "@hugeicons/react";
import { DOC_TYPES } from "./constants";
import { createEditorExtensions } from "./tiptap-setup";

type DocumentEditorProps = {
  document: Document;
  projects: Project[];
  onUpdated: (doc: Document) => void;
  onBack: () => void;
};

type ToolbarAction = {
  icon: IconSvgElement;
  title: string;
  action: (editor: Editor) => void;
  isActive?: (editor: Editor) => boolean;
};

const TOOLBAR_GROUPS: ToolbarAction[][] = [
  [
    {
      icon: TextBoldIcon,
      title: "Bold",
      action: (e) => e.chain().focus().toggleBold().run(),
      isActive: (e) => e.isActive("bold"),
    },
    {
      icon: TextItalicIcon,
      title: "Italic",
      action: (e) => e.chain().focus().toggleItalic().run(),
      isActive: (e) => e.isActive("italic"),
    },
    {
      icon: TextStrikethroughIcon,
      title: "Strikethrough",
      action: (e) => e.chain().focus().toggleStrike().run(),
      isActive: (e) => e.isActive("strike"),
    },
    {
      icon: CodeIcon,
      title: "Inline code",
      action: (e) => e.chain().focus().toggleCode().run(),
      isActive: (e) => e.isActive("code"),
    },
  ],
  [
    {
      icon: Heading01Icon,
      title: "Heading 1",
      action: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: (e) => e.isActive("heading", { level: 1 }),
    },
    {
      icon: Heading02Icon,
      title: "Heading 2",
      action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: (e) => e.isActive("heading", { level: 2 }),
    },
    {
      icon: Heading03Icon,
      title: "Heading 3",
      action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: (e) => e.isActive("heading", { level: 3 }),
    },
  ],
  [
    {
      icon: LeftToRightListBulletIcon,
      title: "Bullet list",
      action: (e) => e.chain().focus().toggleBulletList().run(),
      isActive: (e) => e.isActive("bulletList"),
    },
    {
      icon: LeftToRightListNumberIcon,
      title: "Ordered list",
      action: (e) => e.chain().focus().toggleOrderedList().run(),
      isActive: (e) => e.isActive("orderedList"),
    },
    {
      icon: LeftToRightBlockQuoteIcon,
      title: "Blockquote",
      action: (e) => e.chain().focus().toggleBlockquote().run(),
      isActive: (e) => e.isActive("blockquote"),
    },
    {
      icon: MinusSignIcon,
      title: "Horizontal rule",
      action: (e) => e.chain().focus().setHorizontalRule().run(),
    },
  ],
];

export function DocumentEditor({
  document,
  projects,
  onUpdated,
  onBack,
}: DocumentEditorProps) {
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [saving, setSaving] = useState(false);
  const isLoadingContent = useRef(false);

  const save = useCallback(
    async (updates: Parameters<typeof updateDocument>[1]) => {
      setSaving(true);
      const result = await updateDocument(document.id, updates);
      setSaving(false);
      if (result.success) {
        onUpdated(result.data);
      }
    },
    [document.id, onUpdated]
  );

  const debouncedSaveContent = useCallback(
    (content: Record<string, unknown>) => {
      if (isLoadingContent.current) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => save({ content }), 1000);
    },
    [save]
  );

  const resolveImages = useCallback(
    async (content: Record<string, unknown>): Promise<Record<string, unknown>> => {
      const json = JSON.stringify(content);
      const pathRegex = /users\/[^"]+/g;
      const paths = json.match(pathRegex);
      if (!paths || paths.length === 0) return content;

      const urlMap: Record<string, string> = {};
      await Promise.all(
        [...new Set(paths)].map(async (path) => {
          const result = await getSignedUrl(path);
          if (result.success) urlMap[path] = result.data;
        })
      );

      let resolved = json;
      for (const [path, url] of Object.entries(urlMap)) {
        resolved = resolved.replaceAll(path, url);
      }
      return JSON.parse(resolved);
    },
    []
  );

  const initialContent = (() => {
    const content = document.content as Record<string, unknown> | null;
    if (content && content.type) return content;
    return { type: "doc", content: [{ type: "paragraph" }] };
  })();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: createEditorExtensions(),
    content: initialContent,
    onUpdate: ({ editor: ed }) => {
      debouncedSaveContent(ed.getJSON() as Record<string, unknown>);
    },
    editorProps: {
      attributes: {
        class: "outline-none min-h-[200px]",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const content = document.content as Record<string, unknown> | null;
    if (!content || !content.type) return;
    const json = JSON.stringify(content);
    if (!json.includes("users/")) return;
    isLoadingContent.current = true;
    resolveImages(content).then((resolved) => {
      editor.commands.setContent(resolved);
      isLoadingContent.current = false;
    });
  }, [editor, document.id, document.content, resolveImages]);

  const handleImageUpload = useCallback(async () => {
    if (!editor) return;
    const input = window.document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadMedia(formData);
      if (!result.success) return;
      const signedResult = await getSignedUrl(result.data.storage_path);
      if (!signedResult.success) return;
      editor
        .chain()
        .focus()
        .setImage({
          src: signedResult.data,
          alt: result.data.original_name ?? "image",
        })
        .run();
    };
    input.click();
  }, [editor]);

  const handleTitleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const title = e.target.value.trim();
      if (title && title !== document.title) {
        save({ title });
      }
    },
    [document.title, save]
  );

  const handleTypeChange = useCallback(
    (value: string) => {
      const type = value === "none" ? null : value;
      save({ type });
    },
    [save]
  );

  const handleProjectChange = useCallback(
    (value: string) => {
      const project_id = value === "none" ? null : value;
      save({ project_id });
    },
    [save]
  );

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      {/* Title bar */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-2">
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onBack}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        </Button>
        <input
          key={document.id}
          defaultValue={document.title}
          onBlur={handleTitleBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          className="min-w-0 flex-1 bg-transparent text-lg font-semibold outline-none"
          placeholder="Untitled"
        />
        {saving && (
          <HugeiconsIcon
            icon={Loading03Icon}
            size={14}
            className="animate-spin text-muted-foreground"
          />
        )}
      </div>

      {/* Meta + formatting toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border px-4 py-1.5">
        {/* Document meta */}
        <Select
          defaultValue={document.type ?? "none"}
          onValueChange={handleTypeChange}
          key={`type-${document.id}`}
        >
          <SelectTrigger className="h-7 w-36 text-xs">
            <SelectValue placeholder="No type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No type</SelectItem>
            {DOC_TYPES.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          defaultValue={document.project_id ?? "none"}
          onValueChange={handleProjectChange}
          key={`project-${document.id}`}
        >
          <SelectTrigger className="h-7 w-40 text-xs">
            <SelectValue placeholder="No project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No project</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mx-1.5 h-4 w-px bg-border" />

        {/* Formatting buttons */}
        {editor && TOOLBAR_GROUPS.map((group, gi) => (
          <div key={gi} className="flex items-center">
            {gi > 0 && <div className="mx-1.5 h-4 w-px bg-border" />}
            {group.map((item) => (
              <button
                key={item.title}
                type="button"
                title={item.title}
                onClick={() => item.action(editor)}
                className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                  item.isActive?.(editor)
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <HugeiconsIcon icon={item.icon} size={15} />
              </button>
            ))}
          </div>
        ))}

        {/* Image upload */}
        <div className="mx-1.5 h-4 w-px bg-border" />
        <button
          type="button"
          title="Insert image"
          onClick={handleImageUpload}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <HugeiconsIcon icon={Image02Icon} size={15} />
        </button>

        {/* Undo / Redo */}
        <div className="mx-1.5 h-4 w-px bg-border" />
        {editor && (
          <>
            <button
              type="button"
              title="Undo"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <HugeiconsIcon icon={UndoIcon} size={15} />
            </button>
            <button
              type="button"
              title="Redo"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <HugeiconsIcon icon={RedoIcon} size={15} />
            </button>
          </>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="prose prose-sm dark:prose-invert mx-auto max-w-2xl">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
