"use client";
import { useEffect, useState } from "react";
import BrutalInput from "@/components/ui/BrutalInput";
import BrutalButton from "@/components/ui/BrutalButton";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/settings").then((r) => r.json()),
      fetch("/api/admin/profile").then((r) => r.json()),
    ]).then(([s, p]) => {
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
      setLoading(false);
    });
  }, []);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
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
        name,
        title,
        bio,
        avatar,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        socialLinks: links,
        resumeFile,
      }),
    });
    setSavingProfile(false);
  };

  if (loading) return <p className="text-text-muted">Loading...</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl mb-8">Settings</h1>

      <section className="mb-12">
        <h2 className="font-display text-xl mb-6 border-b-2 border-border pb-2">Site Settings</h2>
        <form onSubmit={saveSettings}>
          <BrutalInput label="Site Title" value={siteTitle} onChange={setSiteTitle} />
          <BrutalInput label="Site Description" value={siteDescription} onChange={setSiteDescription} multiline rows={3} />
          <div className="mb-4">
            <span className="block font-mono text-xs uppercase tracking-wider text-text-secondary mb-1.5">OG Image</span>
            <input type="file" accept="image/*" onChange={(e) => upload(e, setOgImage)} className="text-sm mb-1" />
            {ogImage && <img src={ogImage} alt="" className="w-48 h-24 object-cover border-2 border-border" />}
          </div>
          <BrutalInput label="Primary Nav (JSON)" value={primaryNav} onChange={setPrimaryNav} multiline rows={6} />
          <BrutalInput label="Footer Text" value={footerText} onChange={setFooterText} />
          <BrutalButton type="submit" disabled={savingSettings}>{savingSettings ? "Saving..." : "Save Settings"}</BrutalButton>
        </form>
      </section>

      <section>
        <h2 className="font-display text-xl mb-6 border-b-2 border-border pb-2">Profile</h2>
        <form onSubmit={saveProfile}>
          <BrutalInput label="Name" value={name} onChange={setName} />
          <BrutalInput label="Title" value={title} onChange={setTitle} />
          <BrutalInput label="Bio (Markdown)" value={bio} onChange={setBio} multiline />
          <div className="mb-4">
            <span className="block font-mono text-xs uppercase tracking-wider text-text-secondary mb-1.5">Avatar</span>
            <input type="file" accept="image/*" onChange={(e) => upload(e, setAvatar)} className="text-sm mb-1" />
            {avatar && <img src={avatar} alt="" className="w-24 h-24 object-cover border-2 border-border" />}
          </div>
          <BrutalInput label="Skills (comma-separated)" value={skills} onChange={setSkills} />
          <BrutalInput label="Social Links (JSON)" value={socialLinks} onChange={setSocialLinks} multiline rows={6} />
          <div className="mb-4">
            <span className="block font-mono text-xs uppercase tracking-wider text-text-secondary mb-1.5">Resume File</span>
            <input type="file" onChange={(e) => upload(e, setResumeFile)} className="text-sm mb-1" />
            {resumeFile && <a href={resumeFile} className="font-mono text-xs text-accent">Download current</a>}
          </div>
          <BrutalButton type="submit" disabled={savingProfile}>{savingProfile ? "Saving..." : "Save Profile"}</BrutalButton>
        </form>
      </section>
    </div>
  );
}
