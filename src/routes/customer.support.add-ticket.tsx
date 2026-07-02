import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/customer/support/add-ticket")({
  head: () => ({ meta: [{ title: "New support ticket — Nexora" }] }),
  component: AddTicketPage,
});

function AddTicketPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("booking");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <h1 className="text-2xl font-bold">Raise a ticket</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Tell us what happened and we'll get back to you.
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Ticket submitted — we'll be in touch soon.");
          navigate({ to: "/customer/support" });
        }}
      >
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="booking">Booking issue</SelectItem>
              <SelectItem value="payment">Payment / refund</SelectItem>
              <SelectItem value="account">Account & profile</SelectItem>
              <SelectItem value="other">Something else</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Describe the issue</Label>
          <Textarea
            id="message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full">Submit ticket</Button>
      </form>
    </main>
  );
}
