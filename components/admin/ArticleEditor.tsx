"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { saveArticle } from "@/lib/actions/articles";
import { ArticleBody } from "@/components/markdown/ArticleBody";
import { GlassInput } from "@/components/glass/GlassInput";
import type { Article } from "@/types/database";

const AUTOSAVE_MS = 2500;

export function ArticleEditor({ article }: { article: Article }) {
  const [title, setTitle] = useState(article.title);
  const [slug, setSlug] = useState(article.slug);
  const [excerpt, setExcerpt] = useState(article.excerpt ?? "");
  const [coverUrl, setCoverUrl] = useState(article.cover_url ?? "");
  const [tags, setTags] = useState(article.tags.join(", "));
  const [body, setBody] = useState(article.body_md);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [, startTransition] = useTransition();

  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const queueSave = () => {
    dirty.current = true;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(save, AUTOSAVE_MS);
  };

  const save = () => {
    if (!dirty.current) return;
    dirty.current = false;
    const fd = new FormData();
    fd.set("id", article.id);
    fd.set("title", title);
    fd.set("slug", slug);
    fd.set("excerpt", excerpt);
    fd.set("cover_url", coverUrl);
    fd.set("tags", tags);
    fd.set("body_md", body);
    startTransition(async () => {
      await saveArticle(fd);
      setSavedAt(new Date());
    });
  };

  // flush pending save on unmount
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onDropMd = (e: React.DragEvent<HTMLTextAreaElement>) => {
    const file = e.dataTransfer.files?.[0];
    if (!file || !/\.(md|markdown|txt)$/i.test(file.name)) return;
    e.preventDefault();
    file.text().then((text) => {
      setBody(text);
      queueSave();
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <GlassInput
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            queueSave();
          }}
          placeholder="Title"
          aria-label="Title"
          className="text-lg font-semibold"
        />
        <GlassInput
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            queueSave();
          }}
          placeholder="slug-for-the-url"
          aria-label="Slug"
          className="font-mono text-[0.85rem]"
        />
      </div>
      <GlassInput
        value={excerpt}
        onChange={(e) => {
          setExcerpt(e.target.value);
          queueSave();
        }}
        placeholder="One-line excerpt shown on cards"
        aria-label="Excerpt"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <GlassInput
          value={coverUrl}
          onChange={(e) => {
            setCoverUrl(e.target.value);
            queueSave();
          }}
          placeholder="Cover image URL (optional)"
          aria-label="Cover URL"
        />
        <GlassInput
          value={tags}
          onChange={(e) => {
            setTags(e.target.value);
            queueSave();
          }}
          placeholder="tags, comma, separated"
          aria-label="Tags"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <span className="kicker">
            Markdown — drag a .md file here to load it
          </span>
          <textarea
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              queueSave();
            }}
            onDrop={onDropMd}
            onDragOver={(e) => e.preventDefault()}
            onBlur={save}
            spellCheck
            className="min-h-[26rem] w-full resize-y rounded-2xl bg-white/50 p-5 font-mono text-[0.85rem] leading-relaxed text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none focus:shadow-[0_0_0_2px_rgba(47,107,61,0.45)]"
            placeholder={"# Heading\n\nWrite the article…"}
            aria-label="Article markdown"
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="kicker">Live preview (exactly what readers see)</span>
          <div className="glass glass-deep min-h-[26rem] overflow-y-auto p-6">
            <ArticleBody markdown={body || "*Nothing yet…*"} />
          </div>
        </div>
      </div>

      <p className="font-mono text-[0.7rem] text-muted">
        {savedAt
          ? `Autosaved ${savedAt.toLocaleTimeString()}`
          : "Autosaves a few seconds after you stop typing"}
      </p>
    </div>
  );
}
