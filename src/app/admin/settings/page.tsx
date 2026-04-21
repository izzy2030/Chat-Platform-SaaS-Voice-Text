"use client";

import { useMemo, useState, type ComponentType, type ReactNode } from "react";
import {
  BadgeCheck,
  Building2,
  Check,
  Globe,
  MessageSquareText,
  Palette,
  ShieldCheck,
  Sparkles,
  SwatchBook,
  Upload,
  Wand2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn, getInitials } from "@/lib/utils";

const colorSlots = [
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "accent", label: "Accent" },
  { key: "surface", label: "Surface" },
] as const;

type ColorKey = (typeof colorSlots)[number]["key"];

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("Hydra Chat");
  const [website, setWebsite] = useState("https://hydrachat.ai");
  const [supportEmail, setSupportEmail] = useState("hello@hydrachat.ai");
  const [phone, setPhone] = useState("(312) 555-0148");
  const [timezone, setTimezone] = useState("America/Chicago");
  const [location, setLocation] = useState("Chicago, Illinois");
  const [brandSummary, setBrandSummary] = useState(
    "A premium AI assistant studio for fast-moving teams that want polished, human-feeling support."
  );
  const [brandPersonality, setBrandPersonality] = useState(
    "Calm, capable, premium, and clear."
  );
  const [preferredPhrases, setPreferredPhrases] = useState(
    "Absolutely, here is the next best step.\nWe can take care of that.\nLet's keep this moving."
  );
  const [avoidPhrases, setAvoidPhrases] = useState(
    "As an AI language model...\nI cannot help with that right now.\nPlease be advised."
  );
  const [language, setLanguage] = useState("EN");
  const [assistantTone, setAssistantTone] = useState("concierge");
  const [aiModel, setAiModel] = useState("gemini-2.5-flash");
  const [retention, setRetention] = useState("60");
  const [showBranding, setShowBranding] = useState(true);
  const [celebration, setCelebration] = useState(true);
  const [systemPromptStarter, setSystemPromptStarter] = useState(
    "Represent the brand with confidence, empathy, and concise answers. Guide visitors toward the next useful action."
  );
  const [colors, setColors] = useState<Record<ColorKey, string>>({
    primary: "#3B8332",
    secondary: "#DDEFD6",
    accent: "#F4C95D",
    surface: "#F7F8F5",
  });

  const initials = useMemo(() => getInitials(companyName), [companyName]);
  const previewWelcome = `Welcome to ${companyName}. I'm here to help with questions, demos, and next steps.`;

  const setColor = (key: ColorKey, value: string) =>
    setColors((current) => ({ ...current, [key]: value }));

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(59,131,50,0.12),_transparent_28%),linear-gradient(180deg,_rgba(247,248,245,0.95)_0%,_rgba(255,255,255,1)_38%)] px-4 py-6 sm:px-6">
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-6">
        <section className="overflow-hidden rounded-[34px] border border-white/70 bg-white/90 shadow-[0_30px_90px_-45px_rgba(24,28,29,0.35)] backdrop-blur">
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.3fr_0.7fr] lg:px-8">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="rounded-full border-none bg-[#ECF6E8] px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#2F6A29] hover:bg-[#ECF6E8]">
                  Brand & Workspace
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full border-[#DBE8D6] bg-[#F8FBF6] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#5E6B61]"
                >
                  Global Defaults
                </Badge>
              </div>

              <div className="space-y-3">
                <h1 className="max-w-3xl text-3xl font-black tracking-tight text-[#191C1D] sm:text-5xl">
                  Shape how every assistant looks, sounds, and introduces your
                  business.
                </h1>
                <p className="max-w-2xl text-sm font-medium leading-6 text-[#647066] sm:text-base">
                  Keep your brand kit, workspace identity, and assistant
                  defaults in one place. These settings are meant to guide new
                  widgets without replacing the per-widget controls inside
                  Widget Studio.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <HeroStat
                  icon={Palette}
                  label="Brand Kit"
                  value="Colors, logos, visual defaults"
                />
                <HeroStat
                  icon={MessageSquareText}
                  label="Brand Voice"
                  value="Tone, phrases, behavior"
                />
                <HeroStat
                  icon={ShieldCheck}
                  label="Workspace"
                  value="Shared identity and ops defaults"
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-[#E6ECE2] bg-[#F8FBF6] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#6D7A70]">
                    Live Preview
                  </p>
                  <h2 className="mt-1 text-lg font-black text-[#191C1D]">
                    Brand system snapshot
                  </h2>
                </div>
                <div
                  className="flex size-12 items-center justify-center rounded-2xl text-sm font-black text-white shadow-sm"
                  style={{ backgroundColor: colors.primary }}
                >
                  {initials}
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div
                  className="rounded-[26px] border p-4 shadow-sm"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: `${colors.primary}22`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex size-11 items-center justify-center rounded-2xl text-sm font-black text-white"
                        style={{ backgroundColor: colors.primary }}
                      >
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#191C1D]">
                          {companyName}
                        </p>
                        <p className="text-xs font-semibold text-[#6D7A70]">
                          {assistantToneLabel(assistantTone)} assistant
                        </p>
                      </div>
                    </div>
                    {showBranding ? (
                      <Badge className="rounded-full border-none bg-white/80 px-2 py-1 text-[10px] font-black text-[#4D5A50] shadow-sm hover:bg-white/80">
                        Powered by your brand
                      </Badge>
                    ) : null}
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl bg-white px-4 py-3 text-sm font-medium leading-6 text-[#334038] shadow-sm">
                      {previewWelcome}
                    </div>
                    <div
                      className="rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm"
                      style={{
                        backgroundColor: colors.primary,
                        color: "#ffffff",
                      }}
                    >
                      {brandPersonality}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {colorSlots.map((slot) => (
                    <div
                      key={slot.key}
                      className="rounded-2xl border border-[#E5EBE1] bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="size-10 rounded-2xl border border-black/5"
                          style={{ backgroundColor: colors[slot.key] }}
                        />
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6D7A70]">
                            {slot.label}
                          </p>
                          <p className="text-sm font-semibold text-[#191C1D]">
                            {colors[slot.key]}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-[24px] border border-dashed border-[#D8E6D3] bg-white/70 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6D7A70]">
                    Applies to new widgets
                  </p>
                  <ul className="mt-3 space-y-2 text-sm font-medium text-[#455247]">
                    <PreviewBullet text="Default welcome tone and brand language" />
                    <PreviewBullet text="Brand colors for future assistant experiences" />
                    <PreviewBullet text="Workspace contact details for shared identity" />
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <SettingsCard
              icon={SwatchBook}
              title="Brand Kit"
              description="Set the visual language new assistants should inherit by default."
            >
              <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
                <div className="rounded-[26px] border border-dashed border-[#D7E4D3] bg-[#F8FBF6] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-[#191C1D]">
                        Company mark
                      </p>
                      <p className="mt-1 text-sm text-[#6D7A70]">
                        Keep a shared logo and compact icon ready for future
                        widgets and surfaces.
                      </p>
                    </div>
                    <div
                      className="flex size-14 items-center justify-center rounded-[20px] text-base font-black text-white"
                      style={{ backgroundColor: colors.primary }}
                    >
                      {initials}
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-2xl border-[#D7E4D3] bg-white text-[#1C2320]"
                    >
                      <Upload className="size-4" />
                      Upload primary logo
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-2xl border-[#D7E4D3] bg-white text-[#1C2320]"
                    >
                      <Upload className="size-4" />
                      Upload brand icon
                    </Button>
                    <p className="text-xs font-medium leading-5 text-[#6D7A70]">
                      Wiring file storage can come later. For now, this section
                      establishes the right content model and visual hierarchy.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <Label htmlFor="companyName">Company name</Label>
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(event) => setCompanyName(event.target.value)}
                        className="h-11 rounded-xl border-[#D9E3D6] bg-white"
                      />
                    </Field>
                    <Field>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={website}
                        onChange={(event) => setWebsite(event.target.value)}
                        className="h-11 rounded-xl border-[#D9E3D6] bg-white"
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {colorSlots.map((slot) => (
                      <Field key={slot.key}>
                        <Label htmlFor={slot.key}>{slot.label} color</Label>
                        <div className="flex items-center gap-3 rounded-2xl border border-[#D9E3D6] bg-white px-3 py-2 shadow-xs">
                          <input
                            id={slot.key}
                            aria-label={`${slot.label} color`}
                            type="color"
                            value={colors[slot.key]}
                            onChange={(event) =>
                              setColor(slot.key, event.target.value)
                            }
                            className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                          />
                          <Input
                            value={colors[slot.key]}
                            onChange={(event) =>
                              setColor(slot.key, event.target.value)
                            }
                            className="h-9 border-none bg-transparent px-0 shadow-none focus-visible:ring-0"
                          />
                        </div>
                      </Field>
                    ))}
                  </div>
                </div>
              </div>
            </SettingsCard>

            <SettingsCard
              icon={Wand2}
              title="Brand Voice"
              description="Define how the assistant should sound before any widget-level edits happen."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field className="sm:col-span-2">
                  <Label htmlFor="brandSummary">Company summary</Label>
                  <Textarea
                    id="brandSummary"
                    value={brandSummary}
                    onChange={(event) => setBrandSummary(event.target.value)}
                    className="min-h-24 rounded-2xl border-[#D9E3D6] bg-white"
                  />
                </Field>
                <Field>
                  <Label htmlFor="brandPersonality">Brand personality</Label>
                  <Input
                    id="brandPersonality"
                    value={brandPersonality}
                    onChange={(event) =>
                      setBrandPersonality(event.target.value)
                    }
                    className="h-11 rounded-xl border-[#D9E3D6] bg-white"
                  />
                </Field>
                <Field>
                  <Label htmlFor="assistantTone">Default assistant tone</Label>
                  <Select
                    value={assistantTone}
                    onValueChange={(value) => {
                      if (value) setAssistantTone(value);
                    }}
                  >
                    <SelectTrigger className="h-11 w-full rounded-xl border-[#D9E3D6] bg-white">
                      <SelectValue placeholder="Choose a tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concierge">Concierge</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="sales">Sales-forward</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <Label htmlFor="preferredPhrases">Phrases to prefer</Label>
                  <Textarea
                    id="preferredPhrases"
                    value={preferredPhrases}
                    onChange={(event) =>
                      setPreferredPhrases(event.target.value)
                    }
                    className="min-h-28 rounded-2xl border-[#D9E3D6] bg-white"
                  />
                </Field>
                <Field>
                  <Label htmlFor="avoidPhrases">Phrases to avoid</Label>
                  <Textarea
                    id="avoidPhrases"
                    value={avoidPhrases}
                    onChange={(event) => setAvoidPhrases(event.target.value)}
                    className="min-h-28 rounded-2xl border-[#D9E3D6] bg-white"
                  />
                </Field>
              </div>
            </SettingsCard>

            <SettingsCard
              icon={Building2}
              title="Workspace Identity"
              description="Keep the shared company details ready for any assistant, widget, or future automation."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <Label htmlFor="supportEmail">Support email</Label>
                  <Input
                    id="supportEmail"
                    value={supportEmail}
                    onChange={(event) => setSupportEmail(event.target.value)}
                    className="h-11 rounded-xl border-[#D9E3D6] bg-white"
                  />
                </Field>
                <Field>
                  <Label htmlFor="phone">Business phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="h-11 rounded-xl border-[#D9E3D6] bg-white"
                  />
                </Field>
                <Field>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={timezone}
                    onValueChange={(value) => {
                      if (value) setTimezone(value);
                    }}
                  >
                    <SelectTrigger className="h-11 w-full rounded-xl border-[#D9E3D6] bg-white">
                      <SelectValue placeholder="Select a timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Chicago">
                        America/Chicago
                      </SelectItem>
                      <SelectItem value="America/New_York">
                        America/New_York
                      </SelectItem>
                      <SelectItem value="America/Los_Angeles">
                        America/Los_Angeles
                      </SelectItem>
                      <SelectItem value="Europe/London">
                        Europe/London
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    className="h-11 rounded-xl border-[#D9E3D6] bg-white"
                  />
                </Field>
              </div>
            </SettingsCard>

            <SettingsCard
              icon={Sparkles}
              title="Assistant Defaults"
              description="Guide the initial setup for future assistants while leaving room for per-widget customization."
            >
              <div className="grid gap-5">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Field>
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={language}
                      onValueChange={(value) => {
                        if (value) setLanguage(value);
                      }}
                    >
                      <SelectTrigger className="h-11 w-full rounded-xl border-[#D9E3D6] bg-white">
                        <SelectValue placeholder="Default language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EN">English</SelectItem>
                        <SelectItem value="ES">Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <Label htmlFor="aiModel">AI model</Label>
                    <Select
                      value={aiModel}
                      onValueChange={(value) => {
                        if (value) setAiModel(value);
                      }}
                    >
                      <SelectTrigger className="h-11 w-full rounded-xl border-[#D9E3D6] bg-white">
                        <SelectValue placeholder="Model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini-2.5-flash">
                          Gemini 2.5 Flash
                        </SelectItem>
                        <SelectItem value="gemini-2.5-pro">
                          Gemini 2.5 Pro
                        </SelectItem>
                        <SelectItem value="gemini-live">
                          Gemini Live
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <Label htmlFor="retention">Recording retention</Label>
                    <Select
                      value={retention}
                      onValueChange={(value) => {
                        if (value) setRetention(value);
                      }}
                    >
                      <SelectTrigger className="h-11 w-full rounded-xl border-[#D9E3D6] bg-white">
                        <SelectValue placeholder="Retention" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <Label htmlFor="brandingDisplay">Branding</Label>
                    <div className="flex h-11 items-center justify-between rounded-xl border border-[#D9E3D6] bg-white px-4">
                      <span className="text-sm font-medium text-[#1F2A22]">
                        Show branding
                      </span>
                      <Switch
                        checked={showBranding}
                        onCheckedChange={setShowBranding}
                        aria-label="Toggle branding visibility"
                      />
                    </div>
                  </Field>
                </div>

                <Field>
                  <Label htmlFor="systemPromptStarter">
                    Default system prompt starter
                  </Label>
                  <Textarea
                    id="systemPromptStarter"
                    value={systemPromptStarter}
                    onChange={(event) =>
                      setSystemPromptStarter(event.target.value)
                    }
                    className="min-h-28 rounded-2xl border-[#D9E3D6] bg-white"
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <ToggleCard
                    checked={celebration}
                    onCheckedChange={setCelebration}
                    title="Celebration moments"
                    description="Enable success flourishes for future widgets when a goal or conversion is reached."
                  />
                  <div className="rounded-[24px] border border-[#D9E3D6] bg-white p-4">
                    <p className="text-sm font-black text-[#191C1D]">
                      What these defaults should do
                    </p>
                    <ul className="mt-3 space-y-2 text-sm font-medium text-[#556156]">
                      <PreviewBullet text="Speed up creation of future widgets" />
                      <PreviewBullet text="Create consistent voice and visual identity" />
                      <PreviewBullet text="Reduce repeated setup work in Widget Studio" />
                    </ul>
                  </div>
                </div>
              </div>
            </SettingsCard>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <Card className="rounded-[28px] border border-[#E5ECE1] bg-white/95 py-0 shadow-[0_20px_60px_-40px_rgba(24,28,29,0.3)]">
              <CardHeader className="border-b border-[#EEF2EB] px-5 py-5">
                <CardTitle className="text-lg font-black text-[#191C1D]">
                  Workspace snapshot
                </CardTitle>
                <CardDescription className="text-sm font-medium text-[#6D7A70]">
                  A quick read on the identity your assistants will inherit.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 px-5 py-5">
                <div className="rounded-[24px] bg-[#F7FAF5] p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-12 items-center justify-center rounded-2xl text-sm font-black text-white"
                      style={{ backgroundColor: colors.primary }}
                    >
                      {initials}
                    </div>
                    <div>
                      <p className="text-base font-black text-[#191C1D]">
                        {companyName}
                      </p>
                      <p className="text-sm font-medium text-[#6D7A70]">
                        {supportEmail}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[#445046]">
                    {brandSummary}
                  </p>
                </div>

                <div className="space-y-3">
                  <SnapshotRow icon={Globe} label="Website" value={website} />
                  <SnapshotRow icon={Building2} label="Location" value={location} />
                  <SnapshotRow icon={BadgeCheck} label="Timezone" value={timezone} />
                  <SnapshotRow
                    icon={Sparkles}
                    label="Default model"
                    value={modelLabel(aiModel)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border border-[#E5ECE1] bg-[#1C2320] py-0 text-white shadow-[0_24px_70px_-35px_rgba(28,35,32,0.65)]">
              <CardHeader className="px-5 py-5">
                <CardTitle className="text-lg font-black">
                  Voice guidance
                </CardTitle>
                <CardDescription className="text-sm font-medium text-white/65">
                  A compact reminder of what the assistant should sound like.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-5 pb-5">
                <div
                  className="rounded-[22px] p-4"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(59,131,50,0.28), rgba(244,201,93,0.18))",
                  }}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">
                    Personality
                  </p>
                  <p className="mt-2 text-base font-semibold leading-7 text-white">
                    {brandPersonality}
                  </p>
                </div>
                <VoiceList
                  title="Prefer"
                  items={preferredPhrases}
                  dotClassName="bg-[#8BC47F]"
                />
                <VoiceList
                  title="Avoid"
                  items={avoidPhrases}
                  dotClassName="bg-[#F4C95D]"
                />
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

function HeroStat({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-[#E7EEE4] bg-white/80 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-[#F0F7EF] text-[#3B8332]">
          <Icon className="size-4" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6D7A70]">
            {label}
          </p>
          <p className="text-sm font-semibold leading-6 text-[#1E2521]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function SettingsCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="rounded-[30px] border border-[#E5ECE1] bg-white/95 py-0 shadow-[0_20px_55px_-40px_rgba(24,28,29,0.22)]">
      <CardHeader className="border-b border-[#EEF2EB] px-6 py-6">
        <div className="flex items-start gap-4">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[#EEF6EB] text-[#3B8332] shadow-sm">
            <Icon className="size-5" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl font-black tracking-tight text-[#191C1D]">
              {title}
            </CardTitle>
            <CardDescription className="max-w-2xl text-sm font-medium leading-6 text-[#6D7A70]">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 py-6">{children}</CardContent>
    </Card>
  );
}

function Field({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-2.5", className)}>{children}</div>;
}

function ToggleCard({
  checked,
  onCheckedChange,
  title,
  description,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-[#D9E3D6] bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black text-[#191C1D]">{title}</p>
          <p className="mt-1 text-sm leading-6 text-[#6D7A70]">{description}</p>
        </div>
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          aria-label={title}
        />
      </div>
    </div>
  );
}

function PreviewBullet({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="mt-1.5 flex size-4 items-center justify-center rounded-full bg-[#E8F4E3] text-[#3B8332]">
        <Check className="size-3" />
      </div>
      <span>{text}</span>
    </li>
  );
}

function SnapshotRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#EEF2EB] bg-[#FBFCFA] px-3 py-3">
      <div className="flex size-9 items-center justify-center rounded-2xl bg-white text-[#587058] shadow-sm">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7B877D]">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-[#1C2320]">{value}</p>
      </div>
    </div>
  );
}

function VoiceList({
  title,
  items,
  dotClassName,
}: {
  title: string;
  items: string;
  dotClassName: string;
}) {
  const lines = items
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">
        {title}
      </p>
      <div className="mt-3 space-y-2">
        {lines.map((line) => (
          <div key={line} className="flex items-start gap-3 text-sm font-medium text-white/88">
            <div className={cn("mt-1.5 size-2 rounded-full", dotClassName)} />
            <span>{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function assistantToneLabel(value: string) {
  switch (value) {
    case "professional":
      return "Professional";
    case "warm":
      return "Warm";
    case "sales":
      return "Sales-forward";
    default:
      return "Concierge";
  }
}

function modelLabel(value: string) {
  switch (value) {
    case "gemini-2.5-pro":
      return "Gemini 2.5 Pro";
    case "gemini-live":
      return "Gemini Live";
    default:
      return "Gemini 2.5 Flash";
  }
}
