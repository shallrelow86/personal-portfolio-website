"use client";
import { useEffect, useState } from "react";
import BrutalInput from "@/components/ui/BrutalInput";
import BrutalButton from "@/components/ui/BrutalButton";
import BrutalCard from "@/components/ui/BrutalCard";

export default function SettingsPage() {
  const [siteTitle, setSiteTitle] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [primaryNav, setPrimaryNav] = useState("");
  const [footerText, setFooterText] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [skills, setSkills] = useState("");
  const [socialLinks, setSocialLinks] = useState("");
  const [resumeFile, setResumeFile] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiStatus, setAiStatus] = useState<{
    llm: boolean; embed: boolean; cos: boolean;
    llmLocal?: boolean; embedLocal?: boolean;
    llmModel?: string; embedModel?: string;
    indexCount?: number;
  } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/settings").then((r) => r.json()),
      fetch("/api/admin/profile").then((r) => r.json()),
      fetch("/api/admin/ai-status").then((r) => r.json()),
    ]).then(([s, p, a]) => {
      setSiteTitle(s.siteTitle || "");
      setSiteDescription(s.siteDescription || "");
      setOgImage(s.ogImage || "");
      setPrimaryNav(JSON.stringify(s.primaryNav || [], null, 2));
      setFooterText(s.footerText || "");
      setName(p.name || "");
      setTitle(p.title || "");
      setBio(p.bio || "");
      setAvatar(p.avatar || "");
      setSkills((p.skills || []).join(", "));
      setSocialLinks(JSON.stringify(p.socialLinks || [], null, 2));
      setResumeFile(p.resumeFile || "");
      setAiStatus(a);
      setLoading(false);
    });
  }, []);

  const upload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string) => void,
    kind: "image" | "resume" = "image"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", kind);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setter(data.url);
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    let nav = [];
    try { nav = JSON.parse(primaryNav); } catch { /* keep [] */ }
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteTitle, siteDescription, ogImage, primaryNav: nav, footerText }),
    });
    setSavingSettings(false);
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    let links = [];
    try { links = JSON.parse(socialLinks); } catch { /* keep [] */ }
    await fetch("/api/admin/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, title, bio, avatar,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        socialLinks: links, resumeFile,
      }),
    });
    setSavingProfile(false);
  };

  const rebuild = async () => {
    setRebuilding(true);
    try {
      const res = await fetch("/api/admin/rebuild-index", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      const status = await fetch("/api/admin/ai-status").then((r) => r.json());
      setAiStatus(status);
      alert(
        data.failed
          ? `重建完成：成功 ${data.done}/${data.total}，失败 ${data.failed}`
          : `重建完成：${data.done ?? status.indexCount ?? "?"} 条`
      );
    } finally {
      setRebuilding(false);
    }
  };

  if (loading) return <p className="text-text-muted">加载中…</p>;

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl mb-1">设置</h1>
        <p className="text-text-muted text-sm">站点信息、个人资料与 AI 索引</p>
      </div>

      <BrutalCard className="mb-8">
        <h2 className="font-display text-xl mb-5">站点设置</h2>
        <form onSubmit={saveSettings}>
          <BrutalInput label="站点标题" value={siteTitle} onChange={setSiteTitle} />
          <BrutalInput label="站点描述" value={siteDescription} onChange={setSiteDescription} multiline rows={3} />
          <div className="mb-4">
            <span className="block font-mono text-xs tracking-wider text-text-secondary mb-1.5">OG 封面图</span>
            <input type="file" accept="image/*" onChange={(e) => upload(e, setOgImage)} className="text-sm mb-1" />
            {ogImage && <img src={ogImage} alt="" className="w-48 h-24 object-cover rounded-lg border border-border" />}
          </div>
          <BrutalInput label="主导航（JSON）" value={primaryNav} onChange={setPrimaryNav} multiline rows={6} />
          <BrutalInput label="页脚文字" value={footerText} onChange={setFooterText} />
          <BrutalButton type="submit" primary disabled={savingSettings}>
            {savingSettings ? "保存中…" : "保存站点设置"}
          </BrutalButton>
        </form>
      </BrutalCard>

      <BrutalCard className="mb-8">
        <h2 className="font-display text-xl mb-3">AI 索引</h2>
        <div className="flex flex-wrap gap-2 mb-4 text-xs">
          <span className={`brutal-tag ${aiStatus?.llm ? "!text-accent !border-accent/30" : ""}`}>
            {aiStatus?.llmLocal ? "Ollama" : "LLM"} {aiStatus?.llm ? `已就绪 (${aiStatus.llmModel})` : "未配置"}
          </span>
          <span className={`brutal-tag ${aiStatus?.embed ? "!text-accent !border-accent/30" : ""}`}>
            {aiStatus?.embedLocal ? "本地向量" : "Embedding"} {aiStatus?.embed ? `已就绪 (${aiStatus.embedModel})` : "未配置"}
          </span>
          <span className={`brutal-tag ${aiStatus?.cos ? "!text-accent !border-accent/30" : ""}`}>
            COS {aiStatus?.cos ? "已配置" : "未配置"}
          </span>
        </div>
        <p className="text-text-muted text-sm mb-4">
          当前索引条目：<span className="font-mono text-text-primary">{aiStatus?.indexCount ?? "—"}</span>
          。为全部内容重建向量索引。默认使用本地 Ollama（<code className="font-mono text-xs">LLM_BASE_URL</code>），也可配置云端 API Key。
        </p>
        <BrutalButton onClick={rebuild} disabled={rebuilding || !aiStatus?.llm || !aiStatus?.embed}>
          {rebuilding ? "重建中…" : "重建 AI 索引"}
        </BrutalButton>
      </BrutalCard>

      <BrutalCard>
        <h2 className="font-display text-xl mb-5">个人资料</h2>
        <form onSubmit={saveProfile}>
          <BrutalInput label="姓名" value={name} onChange={setName} />
          <BrutalInput label="头衔" value={title} onChange={setTitle} />
          <BrutalInput label="简介（Markdown）" value={bio} onChange={setBio} multiline />
          <div className="mb-4">
            <span className="block font-mono text-xs tracking-wider text-text-secondary mb-1.5">头像</span>
            <input type="file" accept="image/*" onChange={(e) => upload(e, setAvatar)} className="text-sm mb-1" />
            {avatar && <img src={avatar} alt="" className="w-24 h-24 object-cover rounded-full border border-border" />}
          </div>
          <BrutalInput label="技能（逗号分隔）" value={skills} onChange={setSkills} />
          <BrutalInput label="社交链接（JSON）" value={socialLinks} onChange={setSocialLinks} multiline rows={6} />
          <div className="mb-4">
            <span className="block font-mono text-xs tracking-wider text-text-secondary mb-1.5">简历文件</span>
            <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => upload(e, setResumeFile, "resume")} className="text-sm mb-1" />
            {resumeFile && <a href={resumeFile} className="font-mono text-xs text-accent">下载当前文件</a>}
          </div>
          <BrutalButton type="submit" primary disabled={savingProfile}>
            {savingProfile ? "保存中…" : "保存个人资料"}
          </BrutalButton>
        </form>
      </BrutalCard>
    </div>
  );
}
