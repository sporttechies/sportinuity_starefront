"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import {
  downloadInvoicePdf,
  listRequestInvoices,
  type TeamInvoice,
} from "../lib/api";
import { formatDate } from "../lib/format";

function money(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function badge(invoice: TeamInvoice) {
  if (invoice.status === "paid") return { label: "Paid", style: "bg-[#eaf5ee] text-[#1c673e]" };
  if (invoice.status === "void") return { label: "Void", style: "bg-slate-100 text-slate-500" };
  if (invoice.dueDate && invoice.dueDate.slice(0, 10) < today())
    return { label: "Overdue", style: "bg-red-50 text-red-700" };
  return { label: "Awaiting payment", style: "bg-[#fff4dc] text-[#a36a00]" };
}

/** Issued invoices for one of the team's requests. Renders nothing when there are none. */
export default function TeamInvoices({ reference }: { reference: string }) {
  const [invoices, setInvoices] = useState<TeamInvoice[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    let cancelled = false;
    listRequestInvoices(reference)
      .then((list) => !cancelled && setInvoices(list))
      .catch(() => !cancelled && setInvoices([])); // invoices are optional: never block the page
    return () => {
      cancelled = true;
    };
  }, [reference]);

  async function download(invoice: TeamInvoice) {
    setBusyId(invoice.id);
    setError("");
    try {
      await downloadInvoicePdf(invoice);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not download the invoice.");
    } finally {
      setBusyId("");
    }
  }

  if (!invoices || invoices.length === 0) return null;

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-black">Invoices</h2>
      {error && (
        <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      <ul className="mt-3 divide-y divide-slate-100">
        {invoices.map((invoice) => {
          const status = badge(invoice);
          return (
            <li key={invoice.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div className="min-w-0">
                <p className="font-bold">
                  {invoice.number} · {money(invoice.total, invoice.currency)}
                </p>
                <p className="mt-0.5 text-sm text-slate-500">
                  Issued {formatDate(invoice.issueDate)}
                  {invoice.status === "issued" && invoice.dueDate ? ` · due ${formatDate(invoice.dueDate)}` : ""}
                  {invoice.status === "paid" && invoice.paidAt ? ` · paid ${formatDate(invoice.paidAt)}` : ""}
                  {invoice.status === "void" && invoice.voidReason ? ` · ${invoice.voidReason}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${status.style}`}>
                  {status.label}
                </span>
                <button
                  type="button"
                  onClick={() => download(invoice)}
                  disabled={busyId === invoice.id}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-bold hover:bg-slate-50 disabled:opacity-60"
                >
                  <Download className="size-4" />
                  {busyId === invoice.id ? "Preparing…" : "PDF"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
