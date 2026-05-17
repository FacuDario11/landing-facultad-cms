"use client";

import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Heading2, Italic, List, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TiptapEditorProps = {
  value?: string;
  onChange?: (html: string) => void;
};

export function TiptapEditor({ value = "<p></p>", onChange }: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Escribí el contenido institucional..." })
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "prose-institutional min-h-56 rounded-b-md border border-t-0 bg-background p-4 focus:outline-none"
      }
    },
    onUpdate: ({ editor }) => onChange?.(editor.getHTML())
  });

  if (!editor) return null;

  const actions = [
    { label: "Negrita", icon: Bold, active: editor.isActive("bold"), run: () => editor.chain().focus().toggleBold().run() },
    { label: "Itálica", icon: Italic, active: editor.isActive("italic"), run: () => editor.chain().focus().toggleItalic().run() },
    { label: "Título", icon: Heading2, active: editor.isActive("heading", { level: 2 }), run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "Lista", icon: List, active: editor.isActive("bulletList"), run: () => editor.chain().focus().toggleBulletList().run() },
    { label: "Deshacer", icon: Undo2, active: false, run: () => editor.chain().focus().undo().run() }
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-1 rounded-t-md border bg-muted p-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            type="button"
            variant="ghost"
            size="icon"
            title={action.label}
            className={cn(action.active && "bg-background text-primary")}
            onClick={action.run}
          >
            <action.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
