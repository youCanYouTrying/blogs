"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";

type EditorProps = {
  value: string;
  onChange: (value: string) => void;
};

const lowlight = createLowlight(common);

function ToolbarButton({
  label,
  active = false,
  disabled = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "border px-3 py-2 text-xs font-medium tracking-[0.14em] transition-colors duration-200",
        active
          ? "border-amber-700 bg-amber-50 text-amber-800"
          : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:text-stone-900",
        disabled ? "cursor-not-allowed opacity-50" : "",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export default function Editor({ value, onChange }: EditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        codeBlock: false,
      }),
      Image.configure({
        inline: false,
        HTMLAttributes: {
          class: "rounded-md border border-stone-200",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-amber-800 underline decoration-stone-300 underline-offset-4",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "rounded-lg bg-stone-950 text-stone-100",
        },
      }),
      Placeholder.configure({
        placeholder: "开始输入正文内容，支持标题、列表、引用、链接、图片和代码块。",
      }),
    ],
    content: value || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "tiptap-editor min-h-[360px] max-w-none border-0 px-0 py-0 text-[1.02rem] leading-8 text-stone-800 focus:outline-none prose prose-neutral",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const nextValue = value || "<p></p>";

    if (editor.getHTML() !== nextValue) {
      editor.commands.setContent(nextValue, { emitUpdate: false });
    }
  }, [editor, value]);

  async function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file || !editor) {
      return;
    }

    setUploadingImage(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || "图片上传失败");
      }

      editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "图片上传失败，请稍后重试",
      );
    } finally {
      event.target.value = "";
      setUploadingImage(false);
    }
  }

  function handleLinkAction() {
    if (!editor) {
      return;
    }

    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const nextUrl = window.prompt("输入链接地址", previousUrl ?? "");

    if (nextUrl === null) {
      return;
    }

    if (!nextUrl.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: nextUrl }).run();
  }

  const toolbarDisabled = !editor || uploadingImage;

  return (
    <div className="border border-stone-200 bg-white">
      <div className="flex flex-wrap gap-2 border-b border-stone-200 bg-stone-50/70 p-3">
        <ToolbarButton
          label="H1"
          disabled={toolbarDisabled}
          active={editor?.isActive("heading", { level: 1 }) ?? false}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        />
        <ToolbarButton
          label="H2"
          disabled={toolbarDisabled}
          active={editor?.isActive("heading", { level: 2 }) ?? false}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          label="H3"
          disabled={toolbarDisabled}
          active={editor?.isActive("heading", { level: 3 }) ?? false}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <ToolbarButton
          label="H4"
          disabled={toolbarDisabled}
          active={editor?.isActive("heading", { level: 4 }) ?? false}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()}
        />
        <ToolbarButton
          label="粗体"
          disabled={toolbarDisabled}
          active={editor?.isActive("bold") ?? false}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="斜体"
          disabled={toolbarDisabled}
          active={editor?.isActive("italic") ?? false}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="列表"
          disabled={toolbarDisabled}
          active={editor?.isActive("bulletList") ?? false}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="编号"
          disabled={toolbarDisabled}
          active={editor?.isActive("orderedList") ?? false}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          label="引用"
          disabled={toolbarDisabled}
          active={editor?.isActive("blockquote") ?? false}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          label="代码块"
          disabled={toolbarDisabled}
          active={editor?.isActive("codeBlock") ?? false}
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        />
        <ToolbarButton
          label="链接"
          disabled={toolbarDisabled}
          active={editor?.isActive("link") ?? false}
          onClick={handleLinkAction}
        />
        <ToolbarButton
          label={uploadingImage ? "上传中" : "图片"}
          disabled={toolbarDisabled}
          onClick={() => fileInputRef.current?.click()}
        />
        <ToolbarButton
          label="分割线"
          disabled={toolbarDisabled}
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
        />
      </div>

      <div className="p-5">
        <EditorContent editor={editor} />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleImageUpload}
        />
        {uploadError ? (
          <p className="mt-3 text-sm text-red-600">{uploadError}</p>
        ) : null}
      </div>
    </div>
  );
}
