import { HelpCircle, Inbox } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FAQSection } from "./support/FAQSection";
import { ContactChannels } from "./support/ContactChannels";
import { RaiseTicketForm } from "./support/RaiseTicketForm";
import { MyTicketsList } from "./support/MyTicketsList";

export function SupportPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10">
        <header className="mb-6">
          <h1 className="text-heading text-3xl font-black md:text-4xl">Support Center</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            We're here to help. Search the FAQs, chat with us, or raise a ticket.
          </p>
        </header>

        <Tabs defaultValue="help" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="help" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              Get help
            </TabsTrigger>
            <TabsTrigger value="tickets" className="gap-2">
              <Inbox className="h-4 w-4" />
              My tickets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="help" className="mt-5 space-y-5">
            <FAQSection />
            <ContactChannels />
            <RaiseTicketForm />
          </TabsContent>

          <TabsContent value="tickets" className="mt-5">
            <MyTicketsList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
