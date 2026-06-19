import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ExternalLink, Eye, Image as ImageIcon, Loader2, Sparkles, Upload, X,
} from "lucide-react";
import { toast } from "sonner";
import {
  websiteStatus, currentTemplate, FONT_OPTIONS, PAGE_SECTIONS, SOCIAL_PLATFORMS,
} from "./website/mockWebsite";

export function OwnerWebsitePage() {
  const [primary, setPrimary] = useState("#6366f1");
  const [secondary, setSecondary] = useState("#ec4899");
  const [font, setFont] = useState("inter");
  const [logo, setLogo] = useState<string | null>(null);
  const [metaTitle, setMetaTitle] = useState("Luxe Hair & Spa — Premium Salon in Mumbai");
  const [metaDesc, setMetaDesc] = useState("Award-winning hair, skin and bridal services by certified experts. Book online today.");
  const [keywords, setKeywords] = useState<string[]>(["hair salon", "spa", "bridal makeup", "mumbai"]);
  const [kwInput, setKwInput] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [sections, setSections] = useState(PAGE_SECTIONS);
  const [socials, setSocials] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const addKeyword = () => {
    const v = kwInput.trim();
    if (v && !keywords.includes(v)) setKeywords([...keywords, v]);
    setKwInput("");
  };

  const handlePublish = () => {
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      toast.success("Website published successfully");
    }, 1600);
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Website Management</h1>
          <p className="text-sm text-muted-foreground">Customize your auto-generated booking website.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPreview(true)}>
            <Eye className="h-4 w-4" /> Preview Website
          </Button>
          <Button
            disabled={publishing}
            onClick={handlePublish}
            className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white hover:opacity-90"
          >
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Publish Changes
          </Button>
        </div>
      </div>

      {/* Status card */}
      <Card>
        <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              ● Live
            </Badge>
            <div className="flex items-center gap-2">
              <code className="text-sm bg-muted px-2 py-1 rounded">{websiteStatus.url}</code>
              <Button variant="ghost" size="sm" asChild>
                <a href={websiteStatus.url} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" /> Open
                </a>
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">Last published: {websiteStatus.lastPublished}</div>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{websiteStatus.visitsToday}</div>
              <div className="text-xs text-muted-foreground">Visits today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{websiteStatus.bookingsFromWebsite}</div>
              <div className="text-xs text-muted-foreground">Bookings today</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template */}
      <Card>
        <CardHeader><CardTitle className="text-base">Current Template</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <img src={currentTemplate.screenshot} alt={currentTemplate.name} className="h-32 w-48 object-cover rounded-md border" />
          <div className="flex-1 min-w-[200px]">
            <div className="font-semibold">{currentTemplate.name}</div>
            <p className="text-sm text-muted-foreground mt-1">A clean, elegant template tuned for premium salons.</p>
            <Button variant="outline" size="sm" className="mt-3">Change Template</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Customization panel */}
        <Card>
          <CardHeader><CardTitle className="text-base">Customization</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="text-sm font-medium">Business Logo</label>
              <label className="mt-2 flex items-center justify-center h-28 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden">
                {logo ? (
                  <img src={logo} alt="Logo" className="h-full object-contain" />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Upload className="h-5 w-5 mx-auto mb-1" />
                    <div className="text-xs">Upload logo (PNG/SVG)</div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setLogo(URL.createObjectURL(f));
                  }}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ColorField label="Primary Color" value={primary} onChange={setPrimary} />
              <ColorField label="Secondary Color" value={secondary} onChange={setSecondary} />
            </div>

            <div>
              <label className="text-sm font-medium">Font Family</label>
              <Select value={font} onValueChange={setFont}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">SEO Settings</CardTitle>
            <Button variant="ghost" size="sm"><Sparkles className="h-3.5 w-3.5" /> Regenerate with AI</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Meta Title</label>
              <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} maxLength={60} className="mt-1" />
              <div className="text-xs text-muted-foreground mt-1">{metaTitle.length}/60</div>
            </div>
            <div>
              <label className="text-sm font-medium">Meta Description</label>
              <Textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} maxLength={160} rows={3} className="mt-1" />
              <div className="text-xs text-muted-foreground mt-1">{metaDesc.length}/160</div>
            </div>
            <div>
              <label className="text-sm font-medium">Keywords</label>
              <div className="flex flex-wrap gap-1.5 mt-2 mb-2">
                {keywords.map((k) => (
                  <Badge key={k} variant="secondary" className="gap-1">
                    {k}
                    <button onClick={() => setKeywords(keywords.filter((x) => x !== k))}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add a keyword and press Enter"
                value={kwInput}
                onChange={(e) => setKwInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Domain */}
      <Card>
        <CardHeader><CardTitle className="text-base">Domain Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Current Subdomain</label>
            <div className="mt-2">
              <Badge variant="secondary" className="text-sm py-1.5 px-3">{websiteStatus.subdomain}.nexora.app</Badge>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Custom Domain</label>
            <div className="flex gap-2 mt-2">
              <Input placeholder="www.yourbrand.com" value={customDomain} onChange={(e) => setCustomDomain(e.target.value)} />
              <Button variant="outline">Connect</Button>
            </div>
          </div>
          <Accordion type="single" collapsible>
            <AccordionItem value="cname">
              <AccordionTrigger className="text-sm">CNAME setup instructions</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground">
                  <li>Log in to your DNS provider (GoDaddy, Namecheap, Cloudflare).</li>
                  <li>Add a CNAME record: <code className="bg-muted px-1 rounded">www → cname.nexora.app</code></li>
                  <li>Add an A record: <code className="bg-muted px-1 rounded">@ → 185.158.133.1</code></li>
                  <li>Wait up to 48 hours for DNS propagation.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Page sections */}
      <Card>
        <CardHeader><CardTitle className="text-base">Page Sections</CardTitle></CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sections.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 border rounded-md">
                <span className="text-sm">{s.label}</span>
                <Switch
                  checked={s.enabled}
                  onCheckedChange={(v) => setSections(sections.map((x) => x.id === s.id ? { ...x, enabled: v } : x))}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Socials */}
      <Card>
        <CardHeader><CardTitle className="text-base">Social Media Links</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {SOCIAL_PLATFORMS.map((p) => (
            <div key={p.id} className="grid grid-cols-[120px_1fr] items-center gap-3">
              <label className="text-sm font-medium">{p.label}</label>
              <Input
                placeholder={p.placeholder}
                value={socials[p.id] || ""}
                onChange={(e) => setSocials({ ...socials, [p.id]: e.target.value })}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Preview modal */}
      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="max-w-6xl h-[85vh] p-0 flex flex-col">
          <DialogHeader className="px-4 py-3 border-b">
            <DialogTitle>Website Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 bg-muted flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <div className="text-sm">Iframe preview of {websiteStatus.url}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <button className="mt-2 flex items-center gap-2 w-full border rounded-md px-2 py-1.5 hover:bg-muted">
            <div className="h-6 w-6 rounded border" style={{ backgroundColor: value }} />
            <span className="text-sm font-mono">{value}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <HexColorPicker color={value} onChange={onChange} />
          <Input value={value} onChange={(e) => onChange(e.target.value)} className="mt-3 font-mono text-sm" />
        </PopoverContent>
      </Popover>
    </div>
  );
}
