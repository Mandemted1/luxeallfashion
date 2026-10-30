"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { OrderStatus } from "@luxe/database";
import { Mail, Megaphone, Percent, Users } from "lucide-react";
import {
  previewCampaignAudienceCount,
  previewEmailBrand,
  previewOrderEmailTemplate,
  replyToSupportMessage,
  saveEmailBrandSettings,
  saveOrderEmailTemplate,
  sendCustomerEmail,
  sendMarketingCampaign,
  type CampaignAudience,
} from "@/app/(app)/marketing/actions";
import { InsightCard } from "@/components/insight-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerCombobox } from "@/components/customer-combobox";
import { FacetedFilter } from "@/components/faceted-filter";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { brandFilters, brandLabel, type Brand } from "@/lib/brands";
import type { AdminCustomer } from "@/lib/customers";
import { formatDiscountValue, type AdminDiscountCode } from "@/lib/discount-codes";
import type { EmailBrand, EmailFontSize } from "@/lib/email-brand";
import type { AdminNewsletterSubscriber } from "@/lib/newsletter";
import { fromPrismaOrderStatus } from "@/lib/order-status";

export interface AdminOrderEmailTemplate {
  subject: string;
  heading: string;
  bodyText: string;
  isCustomized: boolean;
}

export interface AdminSupportMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  repliedAt: string | null;
}

const labelClass = "flex flex-col gap-1.5 text-xs font-medium tracking-[0.1em] text-black/50 uppercase";

const brands: Brand[] = brandFilters
  .map((filter) => filter.value)
  .filter((value): value is Brand => value !== "all");

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function sourceLabel(source: string): string {
  if (source === "popup") return "Signup Popup";
  if (source === "footer") return "Newsletter Section";
  return source;
}

function startOfMonth(): Date {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function MarketingContent({
  customers,
  discountCodes,
  subscribers,
  orderEmailStatuses,
  orderEmailTemplates,
  supportMessages,
  emailBrand,
}: {
  customers: AdminCustomer[];
  discountCodes: AdminDiscountCode[];
  subscribers: AdminNewsletterSubscriber[];
  orderEmailStatuses: OrderStatus[];
  orderEmailTemplates: Record<OrderStatus, AdminOrderEmailTemplate>;
  supportMessages: AdminSupportMessage[];
  emailBrand: EmailBrand;
}) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const [subscribersCopied, setSubscribersCopied] = useState(false);
  const [subscribersCopyError, setSubscribersCopyError] = useState("");
  const optedIn = customers.filter((c) => c.marketingOptIn);
  const optInRate = customers.length === 0 ? 0 : Math.round((optedIn.length / customers.length) * 100);
  const activeCodes = discountCodes.filter((code) => code.isActive);
  const monthStart = startOfMonth();
  const newSubscribersThisMonth = subscribers.filter((s) => s.createdAt >= monthStart).length;

  async function copyEmails() {
    const emails = optedIn.map((c) => c.email).join(", ");
    try {
      await navigator.clipboard.writeText(emails);
      setCopyError("");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError("Couldn't copy. Your browser blocked clipboard access.");
    }
  }

  async function copySubscriberEmails() {
    const emails = subscribers.map((s) => s.email).join(", ");
    try {
      await navigator.clipboard.writeText(emails);
      setSubscribersCopyError("");
      setSubscribersCopied(true);
      setTimeout(() => setSubscribersCopied(false), 2000);
    } catch {
      setSubscribersCopyError("Couldn't copy. Your browser blocked clipboard access.");
    }
  }

  // ---- Order-status email templates ----
  const [editingStatus, setEditingStatus] = useState<OrderStatus | null>(null);
  const [templateForm, setTemplateForm] = useState({ subject: "", heading: "", bodyText: "" });
  const [templatePreviewHtml, setTemplatePreviewHtml] = useState("");
  const [templateSaving, setTemplateSaving] = useState(false);
  const [templateError, setTemplateError] = useState("");

  function openTemplateEditor(status: OrderStatus) {
    const current = orderEmailTemplates[status];
    setTemplateForm({ subject: current.subject, heading: current.heading, bodyText: current.bodyText });
    setTemplateError("");
    setEditingStatus(status);
    previewOrderEmailTemplate(current).then(setTemplatePreviewHtml);
  }

  function updateTemplateForm(patch: Partial<typeof templateForm>) {
    const next = { ...templateForm, ...patch };
    setTemplateForm(next);
    previewOrderEmailTemplate(next).then(setTemplatePreviewHtml);
  }

  async function handleSaveTemplate() {
    if (!editingStatus) return;
    setTemplateSaving(true);
    setTemplateError("");
    try {
      const result = await saveOrderEmailTemplate(editingStatus, templateForm);
      if (result.error) {
        setTemplateError(result.error);
        return;
      }
      setEditingStatus(null);
    } catch {
      setTemplateError("Couldn't save. Try again.");
    } finally {
      setTemplateSaving(false);
    }
  }

  // ---- Email branding (one shared look for every outgoing email) ----
  const [brandForm, setBrandForm] = useState(emailBrand);
  const [brandPreviewHtml, setBrandPreviewHtml] = useState("");
  const [brandSaving, setBrandSaving] = useState(false);
  const [brandError, setBrandError] = useState("");
  const [brandSaved, setBrandSaved] = useState(false);

  useEffect(() => {
    previewEmailBrand(emailBrand).then(setBrandPreviewHtml);
    // Only on mount — further previews are driven by updateBrandForm as
    // the admin edits, not by emailBrand changing (it only changes via a
    // full page refresh after a save, which already resets this form).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateBrandForm(patch: Partial<EmailBrand>) {
    const next = { ...brandForm, ...patch };
    setBrandForm(next);
    setBrandSaved(false);
    previewEmailBrand(next).then(setBrandPreviewHtml);
  }

  async function handleSaveBrand() {
    setBrandSaving(true);
    setBrandError("");
    try {
      const result = await saveEmailBrandSettings(brandForm);
      if (result.error) {
        setBrandError(result.error);
        return;
      }
      setBrandSaved(true);
    } catch {
      setBrandError("Couldn't save. Try again.");
    } finally {
      setBrandSaving(false);
    }
  }

  // ---- Marketing campaign ----
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignBody, setCampaignBody] = useState("");
  const [campaignAudience, setCampaignAudience] = useState<CampaignAudience>("both");
  const [campaignAudienceCount, setCampaignAudienceCount] = useState<number | null>(null);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(new Set());
  const [campaignConfirmOpen, setCampaignConfirmOpen] = useState(false);
  const [campaignSending, setCampaignSending] = useState(false);
  const [campaignError, setCampaignError] = useState("");
  const [campaignResult, setCampaignResult] = useState("");

  // "Select Customers" counts from the picker directly — no round trip,
  // the UI already knows exactly how many it picked. Every other mode
  // asks the server, since it's counting rows the UI doesn't have loaded.
  const effectiveCampaignCount =
    campaignAudience === "selectedCustomers" ? selectedCustomerIds.size : campaignAudienceCount;

  function openCampaignSheet() {
    setCampaignSubject("");
    setCampaignBody("");
    setCampaignAudience("both");
    setSelectedCustomerIds(new Set());
    setCampaignError("");
    setCampaignResult("");
    setCampaignOpen(true);
    previewCampaignAudienceCount("both").then(setCampaignAudienceCount);
  }

  function updateCampaignAudience(next: CampaignAudience) {
    setCampaignAudience(next);
    if (next === "selectedCustomers") return;
    setCampaignAudienceCount(null);
    previewCampaignAudienceCount(next).then(setCampaignAudienceCount);
  }

  async function handleSendCampaign() {
    setCampaignSending(true);
    setCampaignError("");
    try {
      const result = await sendMarketingCampaign({
        subject: campaignSubject,
        bodyText: campaignBody,
        audience: campaignAudience,
        customerIds: campaignAudience === "selectedCustomers" ? Array.from(selectedCustomerIds) : undefined,
      });
      if (result.error) {
        setCampaignError(result.error);
        return;
      }
      setCampaignConfirmOpen(false);
      setCampaignOpen(false);
      setCampaignResult(`Sending to ${result.queuedCount} recipients.`);
    } catch {
      setCampaignError("Couldn't send. Try again.");
    } finally {
      setCampaignSending(false);
    }
  }

  // ---- Personalized email / support reply (shared compose sheet) ----
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeReplyTo, setComposeReplyTo] = useState<string | null>(null);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeSending, setComposeSending] = useState(false);
  const [composeError, setComposeError] = useState("");
  const [composeSuccess, setComposeSuccess] = useState("");

  function openCompose() {
    setComposeReplyTo(null);
    setComposeTo("");
    setComposeSubject("");
    setComposeBody("");
    setComposeError("");
    setComposeSuccess("");
    setComposeOpen(true);
  }

  function openReply(supportMessage: AdminSupportMessage) {
    setComposeReplyTo(supportMessage.id);
    setComposeTo(supportMessage.email);
    setComposeSubject("Re: your message to Luxe All Fashion");
    setComposeBody(`\n\n---\nYou wrote: ${supportMessage.message}`);
    setComposeError("");
    setComposeSuccess("");
    setComposeOpen(true);
  }

  async function handleSendCompose() {
    setComposeSending(true);
    setComposeError("");
    try {
      const result = composeReplyTo
        ? await replyToSupportMessage(composeReplyTo, {
            subject: composeSubject,
            bodyText: composeBody,
          })
        : await sendCustomerEmail({ to: composeTo, subject: composeSubject, bodyText: composeBody });
      if (result.error) {
        setComposeError(result.error);
        return;
      }
      setComposeSuccess("Sent.");
      setTimeout(() => setComposeOpen(false), 1200);
    } catch {
      setComposeError("Couldn't send. Try again.");
    } finally {
      setComposeSending(false);
    }
  }

  return (
    <div>
      <div>
        <h1 className="text-3xl font-semibold">Marketing</h1>
        <p className="mt-1 text-sm text-black/50">Newsletter copy and subscriber list.</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InsightCard
          label="Total Customers"
          value={String(customers.length)}
          hint="Across all three stores"
          icon={Users}
        />
        <InsightCard
          label="Opted In to Marketing"
          value={String(optedIn.length)}
          hint="Customers you can email"
          icon={Mail}
        />
        <InsightCard
          label="Opt-In Rate"
          value={`${optInRate}%`}
          hint="Share of all customers"
          icon={Percent}
        />
        <InsightCard
          label="Newsletter Signups"
          value={String(subscribers.length)}
          hint={`${newSubscribersThisMonth} new this month`}
          icon={Megaphone}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Opt-In by Store</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-4">
              {brands.map((brand) => {
                const brandCustomers = customers.filter((c) => c.brands.includes(brand));
                const brandOptedIn = brandCustomers.filter((c) => c.marketingOptIn);
                const rate =
                  brandCustomers.length === 0
                    ? 0
                    : Math.round((brandOptedIn.length / brandCustomers.length) * 100);
                return (
                  <li key={brand}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">{brandLabel(brand)}</p>
                      <p className="text-sm font-semibold">
                        {brandOptedIn.length} / {brandCustomers.length}
                      </p>
                    </div>
                    <Progress value={rate} className="mt-2 h-1" />
                    <p className="mt-1 text-xs text-black/50">{rate}% opted in</p>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Discount Codes</CardTitle>
            <CardAction>
              <Link
                href="/discount-codes"
                className="text-xs font-medium tracking-[0.08em] text-black/50 uppercase hover:text-black"
              >
                Manage
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            {activeCodes.length === 0 ? (
              <p className="text-sm text-black/40">No active codes.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-black/5">
                {activeCodes.map((code) => (
                  <li key={code.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="font-mono text-sm font-semibold">{code.code}</p>
                      <p className="mt-0.5 text-xs text-black/50">
                        {code.brandFilter === "all" ? "All Stores" : brandLabel(code.brandFilter)}
                      </p>
                    </div>
                    <p className="text-sm font-medium">{formatDiscountValue(code)}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4 gap-0 py-0">
        <div className="flex items-center justify-between gap-3 border-b border-black/10 px-5 py-4">
          <p className="text-xs font-medium tracking-[0.1em] text-black/50 uppercase">
            Opted-In Customers
          </p>
          <div className="flex items-center gap-3">
            {copyError && <p className="text-xs text-red-600">{copyError}</p>}
            <Button type="button" size="sm" onClick={copyEmails} disabled={optedIn.length === 0}>
              {copied ? "Copied" : "Copy Emails"}
            </Button>
          </div>
        </div>
        {optedIn.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-black/40">
            No customers have opted in yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[420px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Customer</TableHead>
                  <TableHead>Store</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {optedIn.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <Link
                        href={`/customers/${encodeURIComponent(customer.id)}`}
                        className="font-medium hover:underline"
                      >
                        {customer.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-black/50">{customer.email}</p>
                    </TableCell>
                    <TableCell className="text-black/60">
                      {customer.brands.length > 0 ? customer.brands.map(brandLabel).join(" + ") : "–"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Card className="mt-4 gap-0 py-0">
        <div className="flex items-center justify-between gap-3 border-b border-black/10 px-5 py-4">
          <p className="text-xs font-medium tracking-[0.1em] text-black/50 uppercase">
            Newsletter Signups
          </p>
          <div className="flex items-center gap-3">
            {subscribersCopyError && <p className="text-xs text-red-600">{subscribersCopyError}</p>}
            <Button
              type="button"
              size="sm"
              onClick={copySubscriberEmails}
              disabled={subscribers.length === 0}
            >
              {subscribersCopied ? "Copied" : "Copy Emails"}
            </Button>
          </div>
        </div>
        {subscribers.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-black/40">
            No newsletter signups yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[420px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Email</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Signed Up</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="font-medium">{subscriber.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-transparent bg-stone-100 text-stone-600">
                        {sourceLabel(subscriber.source)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-black/60">{formatDate(subscriber.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Card className="mt-4 gap-0 py-0">
        <div className="border-b border-black/10 px-5 py-4">
          <p className="text-xs font-medium tracking-[0.1em] text-black/50 uppercase">
            Email Branding
          </p>
          <p className="mt-1 text-xs text-black/40">
            One look applied to every outgoing email — order updates, campaigns, and replies
            alike.
          </p>
        </div>
        <CardContent className="flex flex-col gap-4 py-4 lg:flex-row lg:items-start">
          <div className="flex w-full flex-col gap-4 lg:max-w-xs">
            <label className={labelClass}>
              Accent Color
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={brandForm.accentColor}
                  onChange={(event) => updateBrandForm({ accentColor: event.target.value })}
                  className="h-9 w-12 shrink-0 cursor-pointer border border-black/15 bg-transparent p-1"
                />
                <Input
                  value={brandForm.accentColor}
                  onChange={(event) => updateBrandForm({ accentColor: event.target.value })}
                  className="font-mono uppercase"
                />
              </div>
            </label>
            <label className={labelClass}>
              Text Size
              <Select
                value={brandForm.fontSize}
                onValueChange={(next) => updateBrandForm({ fontSize: next as EmailFontSize })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </label>
            {brandError && <p className="text-xs text-red-600">{brandError}</p>}
            {brandSaved && <p className="text-xs text-emerald-700">Saved.</p>}
            <Button onClick={handleSaveBrand} disabled={brandSaving} className="w-fit">
              {brandSaving ? "Saving..." : "Save"}
            </Button>
          </div>
          <div className="w-full overflow-hidden rounded-lg border border-black/10">
            <iframe srcDoc={brandPreviewHtml} className="h-[360px] w-full" title="Email branding preview" />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4 gap-0 py-0">
        <div className="border-b border-black/10 px-5 py-4">
          <p className="text-xs font-medium tracking-[0.1em] text-black/50 uppercase">
            Order Status Emails
          </p>
          <p className="mt-1 text-xs text-black/40">
            Edit the subject and message sent at each stage. The branding above applies to all
            of them — only the text below changes per stage.
          </p>
        </div>
        <ul className="divide-y divide-black/5">
          {orderEmailStatuses.map((status) => {
            const template = orderEmailTemplates[status];
            return (
              <li key={status} className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{fromPrismaOrderStatus(status)}</p>
                    {template.isCustomized && (
                      <Badge
                        variant="outline"
                        className="border-transparent bg-stone-100 text-[10px] text-stone-600"
                      >
                        Customized
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-black/50">{template.subject}</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => openTemplateEditor(status)}>
                  Edit
                </Button>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="gap-0 py-0">
          <div className="flex items-center justify-between gap-3 border-b border-black/10 px-5 py-4">
            <div>
              <p className="text-xs font-medium tracking-[0.1em] text-black/50 uppercase">
                Send Campaign
              </p>
              <p className="mt-1 text-xs text-black/40">
                A marketing email to subscribers and/or opted-in customers.
              </p>
            </div>
            <Button type="button" size="sm" onClick={openCampaignSheet}>
              New Campaign
            </Button>
          </div>
          <CardContent className="py-4">
            {campaignResult ? (
              <p className="text-sm text-emerald-700">{campaignResult}</p>
            ) : (
              <p className="text-sm text-black/40">
                Every email includes a one-click unsubscribe link automatically.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <div className="flex items-center justify-between gap-3 border-b border-black/10 px-5 py-4">
            <div>
              <p className="text-xs font-medium tracking-[0.1em] text-black/50 uppercase">
                Send a Message
              </p>
              <p className="mt-1 text-xs text-black/40">
                A one-off, personalized email to a single address.
              </p>
            </div>
            <Button type="button" size="sm" onClick={openCompose}>
              New Message
            </Button>
          </div>
          <CardContent className="py-4">
            <p className="text-sm text-black/40">
              Sends immediately from {`"Luxe All Fashion Support"`}.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4 gap-0 py-0">
        <div className="border-b border-black/10 px-5 py-4">
          <p className="text-xs font-medium tracking-[0.1em] text-black/50 uppercase">
            Support Messages
          </p>
        </div>
        {supportMessages.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-black/40">
            No contact-form messages yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>From</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {supportMessages.map((supportMessage) => (
                  <TableRow key={supportMessage.id}>
                    <TableCell>
                      <p className="font-medium">{supportMessage.name}</p>
                      <p className="mt-0.5 text-xs text-black/50">{supportMessage.email}</p>
                    </TableCell>
                    <TableCell className="max-w-[320px]">
                      <p className="line-clamp-2 text-black/70">{supportMessage.message}</p>
                    </TableCell>
                    <TableCell className="text-black/60">
                      {formatDate(new Date(supportMessage.createdAt))}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          supportMessage.repliedAt
                            ? "border-transparent bg-emerald-50 text-emerald-700"
                            : "border-transparent bg-amber-50 text-amber-700"
                        }
                      >
                        {supportMessage.repliedAt ? "Replied" : "New"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openReply(supportMessage)}
                      >
                        Reply
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Sheet open={editingStatus !== null} onOpenChange={(open) => !open && setEditingStatus(null)}>
        <SheetContent className="overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>
              {editingStatus ? `Edit: ${fromPrismaOrderStatus(editingStatus)}` : "Edit template"}
            </SheetTitle>
            <SheetDescription>
              {"{{orderNumber}}"} and {"{{customerName}}"} are replaced automatically when the
              email is sent.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-4 pb-4">
            <label className={labelClass}>
              Subject
              <Input
                value={templateForm.subject}
                onChange={(event) => updateTemplateForm({ subject: event.target.value })}
              />
            </label>
            <label className={labelClass}>
              Heading
              <Input
                value={templateForm.heading}
                onChange={(event) => updateTemplateForm({ heading: event.target.value })}
              />
            </label>
            <label className={labelClass}>
              Message
              <Textarea
                rows={4}
                value={templateForm.bodyText}
                onChange={(event) => updateTemplateForm({ bodyText: event.target.value })}
              />
            </label>
            {templateError && <p className="text-xs text-red-600">{templateError}</p>}
            <div>
              <p className={labelClass}>Preview</p>
              <div className="mt-1.5 overflow-hidden rounded-lg border border-black/10">
                <iframe srcDoc={templatePreviewHtml} className="h-[420px] w-full" title="Email preview" />
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button onClick={handleSaveTemplate} disabled={templateSaving}>
              {templateSaving ? "Saving..." : "Save"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={campaignOpen} onOpenChange={setCampaignOpen}>
        <SheetContent className="overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>New Campaign</SheetTitle>
            <SheetDescription>
              Sent to the audience you choose, each with their own unsubscribe link.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-4 pb-4">
            <label className={labelClass}>
              Audience
              <Select value={campaignAudience} onValueChange={(next) => updateCampaignAudience(next as CampaignAudience)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Subscribers + Opted-In Customers</SelectItem>
                  <SelectItem value="subscribers">Newsletter Subscribers Only</SelectItem>
                  <SelectItem value="optedInCustomers">Opted-In Customers Only</SelectItem>
                  <SelectItem value="selectedCustomers">Select Customers...</SelectItem>
                </SelectContent>
              </Select>
              {campaignAudience === "selectedCustomers" ? (
                <div className="mt-1.5">
                  <FacetedFilter
                    title="Customers"
                    options={customers.map((customer) => ({
                      value: customer.id,
                      label: `${customer.name} (${customer.email})`,
                    }))}
                    selected={selectedCustomerIds}
                    onChange={setSelectedCustomerIds}
                  />
                </div>
              ) : (
                <p className="mt-1 text-xs font-normal normal-case tracking-normal text-black/40">
                  {campaignAudienceCount === null ? "Counting..." : `${campaignAudienceCount} recipients`}
                </p>
              )}
            </label>
            <label className={labelClass}>
              Subject
              <Input value={campaignSubject} onChange={(event) => setCampaignSubject(event.target.value)} />
            </label>
            <label className={labelClass}>
              Message
              <Textarea rows={6} value={campaignBody} onChange={(event) => setCampaignBody(event.target.value)} />
            </label>
            {campaignError && <p className="text-xs text-red-600">{campaignError}</p>}
          </div>
          <SheetFooter>
            <Button
              onClick={() => setCampaignConfirmOpen(true)}
              disabled={!campaignSubject.trim() || !campaignBody.trim() || !effectiveCampaignCount}
            >
              Send Campaign
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={campaignConfirmOpen} onOpenChange={setCampaignConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send to {effectiveCampaignCount} people?</AlertDialogTitle>
            <AlertDialogDescription>
              This sends immediately and can&apos;t be undone or recalled once it goes out.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleSendCampaign();
              }}
              disabled={campaignSending}
            >
              {campaignSending ? "Sending..." : "Send"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={composeOpen} onOpenChange={setComposeOpen}>
        <SheetContent className="overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{composeReplyTo ? "Reply" : "New Message"}</SheetTitle>
            <SheetDescription>Sends immediately to this one address.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-4 pb-4">
            {!composeReplyTo && customers.length > 0 && (
              <label className={labelClass}>
                Pick a Customer (optional)
                <CustomerCombobox
                  customers={customers}
                  onSelect={(customer) => setComposeTo(customer.email)}
                  placeholder="Find a customer..."
                />
              </label>
            )}
            <label className={labelClass}>
              To
              <Input
                type="email"
                value={composeTo}
                onChange={(event) => setComposeTo(event.target.value)}
                disabled={Boolean(composeReplyTo)}
              />
            </label>
            <label className={labelClass}>
              Subject
              <Input value={composeSubject} onChange={(event) => setComposeSubject(event.target.value)} />
            </label>
            <label className={labelClass}>
              Message
              <Textarea rows={6} value={composeBody} onChange={(event) => setComposeBody(event.target.value)} />
            </label>
            {composeError && <p className="text-xs text-red-600">{composeError}</p>}
            {composeSuccess && <p className="text-xs text-emerald-700">{composeSuccess}</p>}
          </div>
          <SheetFooter>
            <Button onClick={handleSendCompose} disabled={composeSending}>
              {composeSending ? "Sending..." : "Send"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
