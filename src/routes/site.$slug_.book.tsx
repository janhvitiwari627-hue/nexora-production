import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, IndianRupee, LoaderCircle, ShieldCheck } from "lucide-react";
import { salonBySlugQueryOptions } from "@/lib/salons.queries";
import { createPublicAppointment } from "@/lib/public-booking";
import { sendBookingConfirmationEmail } from "@/lib/booking-email.functions";
import {
  PublishedSiteShell,
  PublishedSiteUnavailable,
} from "@/pages/public/site/PublishedSiteShell";

const TIMES = [
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
] as const;

export const Route = createFileRoute("/site/$slug_/book")({
  validateSearch: (search: Record<string, unknown>) => ({
    service: typeof search.service === "string" ? search.service : undefined,
  }),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(salonBySlugQueryOptions(params.slug)),
  head: ({ params }) => ({
    meta: [{ title: `Book appointment · ${params.slug} · Nexora` }],
  }),
  component: PublishedBookingPage,
});

function localDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function PublishedBookingPage() {
  const { slug } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { data } = useSuspenseQuery(salonBySlugQueryOptions(slug));
  const services = useMemo(() => data?.services ?? [], [data?.services]);
  const initialService = services.some((service) => service.id === search.service)
    ? search.service
    : services[0]?.id;
  const [serviceId, setServiceId] = useState(initialService ?? "");
  const [staffId, setStaffId] = useState("");
  const [date, setDate] = useState(localDate(1));
  const [time, setTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedService = useMemo(
    () => services.find((service) => service.id === serviceId),
    [serviceId, services],
  );
  const selectedStaff = useMemo(
    () => data?.staff.find((staff) => staff.id === staffId),
    [data?.staff, staffId],
  );
  const total = Number(selectedService?.price ?? 0);
  const advance = Math.round(total * 25) / 100;
  const remaining = Math.round((total - advance) * 100) / 100;

  if (!data?.salon) return <PublishedSiteUnavailable />;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!selectedService || !date || !time) {
      setError("Please select a service, date and time.");
      return;
    }
    setSubmitting(true);
    try {
      const appointment = await createPublicAppointment({
        tenantId: data.salon.id,
        serviceId: selectedService.id,
        date,
        time,
        customerName,
        mobile,
        staffId: staffId || null,
      });
      if (email) {
        try {
          await sendBookingConfirmationEmail({
            data: {
              email,
              customerName,
              bookingReference: appointment.booking_reference,
              salonName: data.salon.name,
              serviceName: selectedService.name,
              date,
              time,
              total,
              advance,
              remaining,
            },
          });
        } catch (mailErr) {
          console.error("Confirmation email failed", mailErr);
        }
      }
      await navigate({
        to: "/site/$slug_/booking-success",
        params: { slug },
        search: { booking: appointment.id },
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Booking could not be created.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublishedSiteShell slug={slug} salonName={data.salon.name}>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <form onSubmit={submit} className="space-y-7">
            <div>
              <p className="text-sm font-semibold text-violet-700">Online appointment</p>
              <h1 className="mt-1 text-3xl font-bold">Book at {data.salon.name}</h1>
              <p className="mt-2 text-sm text-slate-600">
                Select a service and preferred time. Payment is not collected on this page.
              </p>
            </div>

            <fieldset>
              <legend className="mb-3 font-bold">1. Select service</legend>
              {services.length === 0 ? (
                <div className="rounded-xl border bg-white p-5 text-sm text-slate-600">
                  No active services are available.{" "}
                  <Link to="/site/$slug_/services" params={{ slug }} className="text-violet-700">
                    View services
                  </Link>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {services.map((service) => (
                    <label
                      key={service.id}
                      className={`cursor-pointer rounded-xl border bg-white p-4 ${
                        serviceId === service.id ? "border-violet-700 ring-2 ring-violet-100" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="service"
                        value={service.id}
                        checked={serviceId === service.id}
                        onChange={() => setServiceId(service.id)}
                        className="sr-only"
                      />
                      <span className="block font-semibold">{service.name}</span>
                      <span className="mt-1 block text-sm text-slate-600">
                        ₹{Number(service.price).toLocaleString("en-IN")} ·{" "}
                        {service.duration_minutes ?? 30} min
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>

            <fieldset>
              <legend className="mb-3 font-bold">2. Select professional</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <label
                  className={`cursor-pointer rounded-xl border bg-white p-4 ${
                    staffId === "" ? "border-violet-700 ring-2 ring-violet-100" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="staff"
                    value=""
                    checked={staffId === ""}
                    onChange={() => setStaffId("")}
                    className="sr-only"
                  />
                  <span className="block font-semibold">Any professional</span>
                  <span className="mt-1 block text-sm text-slate-600">
                    Salon will assign an available expert.
                  </span>
                </label>
                {data.staff.map((staff) => (
                  <label
                    key={staff.id}
                    className={`cursor-pointer rounded-xl border bg-white p-4 ${
                      staffId === staff.id ? "border-violet-700 ring-2 ring-violet-100" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="staff"
                      value={staff.id}
                      checked={staffId === staff.id}
                      onChange={() => setStaffId(staff.id)}
                      className="sr-only"
                    />
                    <span className="block font-semibold">{staff.name}</span>
                    <span className="mt-1 block text-sm text-slate-600">
                      {staff.role ?? "Beauty professional"}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 font-bold">3. Select date and time</legend>
              <label className="block max-w-sm text-sm font-medium">
                Date
                <span className="relative mt-1 block">
                  <CalendarDays className="absolute top-3 left-3 h-4 w-4 text-slate-500" />
                  <input
                    type="date"
                    value={date}
                    min={localDate()}
                    max={localDate(90)}
                    onChange={(event) => {
                      setDate(event.target.value);
                      setTime("");
                    }}
                    required
                    className="w-full rounded-xl border bg-white py-2.5 pr-3 pl-10"
                  />
                </span>
              </label>
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {TIMES.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    className={`rounded-lg border px-2 py-2.5 text-sm font-medium ${
                      time === slot
                        ? "border-violet-700 bg-violet-700 text-white"
                        : "bg-white hover:border-violet-300"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="grid gap-4 sm:grid-cols-2">
              <legend className="mb-3 font-bold sm:col-span-2">4. Your details</legend>
              <label className="text-sm font-medium">
                Name
                <input
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  required
                  className="mt-1 w-full rounded-xl border bg-white px-3 py-2.5"
                  placeholder="Your full name"
                />
              </label>
              <label className="text-sm font-medium">
                Mobile number
                <input
                  value={mobile}
                  onChange={(event) => setMobile(event.target.value)}
                  inputMode="numeric"
                  autoComplete="tel"
                  pattern="(?:\+91)?[6-9][0-9]{9}"
                  required
                  className="mt-1 w-full rounded-xl border bg-white px-3 py-2.5"
                  placeholder="9876543210"
                />
              </label>
            </fieldset>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !selectedService || !time}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-3 font-semibold text-white hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
              Create appointment
            </button>
          </form>

          <aside className="h-fit rounded-2xl border bg-white p-5 shadow-sm lg:sticky lg:top-6">
            <h2 className="font-bold">Booking summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Service</dt>
                <dd className="text-right font-medium">
                  {selectedService?.name ?? "Select service"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Professional</dt>
                <dd className="text-right font-medium">
                  {selectedStaff?.name ?? "Any professional"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Total</dt>
                <dd className="inline-flex items-center font-bold">
                  <IndianRupee className="h-3.5 w-3.5" />
                  {total.toLocaleString("en-IN")}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Advance (25%)</dt>
                <dd>₹{advance.toLocaleString("en-IN")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Remaining (75%)</dt>
                <dd>₹{remaining.toLocaleString("en-IN")}</dd>
              </div>
            </dl>
            <div className="mt-5 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>No payment will be marked successful. Advance status remains pending.</span>
            </div>
            {time && (
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <Clock className="h-4 w-4" />
                {date} at {time}
              </div>
            )}
          </aside>
        </div>
      </main>
    </PublishedSiteShell>
  );
}
