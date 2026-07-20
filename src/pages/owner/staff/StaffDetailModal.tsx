import { Award, Calendar, IndianRupee, Instagram, MessageCircle, Star } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import type { StaffMember } from "./mockStaff";
import { cn } from "@/lib/utils";

export function StaffDetailModal({
  staff,
  onClose,
  onEdit,
}: {
  staff: StaffMember | null;
  onClose: () => void;
  onEdit: (s: StaffMember) => void;
}) {
  if (!staff) return null;
  return (
    <Modal open={!!staff} onClose={onClose} title={staff.name} size="xl">
      <div className="space-y-6 p-6">
        <header className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <img
              src={staff.photo}
              alt={staff.name}
              className="border-border h-24 w-24 rounded-2xl border object-cover"
            />
            <span
              className={cn(
                "border-card absolute -right-1 -bottom-1 h-5 w-5 rounded-full border-2",
                staff.available ? "bg-success" : "bg-danger",
              )}
            />
          </div>
          <div className="flex-1">
            <div className="text-heading text-xl font-bold">{staff.name}</div>
            <div className="text-muted-foreground text-sm">
              {staff.designation} · {staff.experienceYears} years experience
            </div>
            <div className="mt-1 inline-flex items-center gap-1 text-sm">
              <Star className="fill-warning text-warning h-4 w-4" />
              <span className="text-heading font-semibold">{staff.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({staff.reviewCount} reviews)</span>
            </div>
          </div>
          <div className="flex gap-2">
            {staff.instagram && (
              <a
                href={staff.instagram}
                target="_blank"
                rel="noreferrer"
                className="border-border hover:bg-muted/40 inline-flex h-9 w-9 items-center justify-center rounded-full border"
              >
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {staff.whatsapp && (
              <a
                href={`https://wa.me/${staff.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="text-success border-success/30 hover:bg-success/10 inline-flex h-9 w-9 items-center justify-center rounded-full border"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            )}
          </div>
        </header>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <Metric
            icon={<Calendar className="h-4 w-4" />}
            label="Bookings (mo)"
            value={staff.bookingsThisMonth.toString()}
          />
          <Metric
            icon={<IndianRupee className="h-4 w-4" />}
            label="Revenue (mo)"
            value={`₹${(staff.revenueThisMonth / 1000).toFixed(0)}K`}
          />
          <Metric
            icon={<Star className="h-4 w-4" />}
            label="Rating"
            value={staff.rating.toFixed(1)}
          />
        </div>

        {/* Specializations + languages */}
        <Section title="Specializations">
          <ChipList items={staff.specializations} />
        </Section>
        <Section title="Languages">
          <ChipList items={staff.languages} />
        </Section>

        {/* Certificates */}
        {staff.certificates.length > 0 && (
          <Section title="Certificates">
            <ul className="space-y-1.5">
              {staff.certificates.map((c) => (
                <li key={c} className="text-body inline-flex items-center gap-2 text-sm">
                  <Award className="text-primary h-4 w-4" /> {c}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Portfolio */}
        {staff.portfolio.length > 0 && (
          <Section title="Portfolio">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {staff.portfolio.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="border-border aspect-square w-full rounded-lg border object-cover"
                />
              ))}
            </div>
          </Section>
        )}

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={() => {
              onEdit(staff);
              onClose();
            }}
          >
            Edit profile
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-heading mb-2 text-xs font-semibold uppercase tracking-wide">{title}</h4>
      {children}
    </div>
  );
}

function ChipList({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-muted-foreground text-sm">None listed.</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((s) => (
        <span key={s} className="bg-muted text-body rounded-full px-2.5 py-0.5 text-xs">
          {s}
        </span>
      ))}
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-muted/40 rounded-xl p-3">
      <div className="text-muted-foreground inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide">
        {icon} {label}
      </div>
      <div className="text-heading mt-1 text-lg font-bold">{value}</div>
    </div>
  );
}
