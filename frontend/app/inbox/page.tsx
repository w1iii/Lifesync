"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import AmbientOrbs from "@/components/AmbientOrbs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { fetchInboxEmails } from "@/lib/api";

interface Email {
  id: string;
  from: string;
  to?: string;
  subject: string;
  snippet: string;
  timestamp: string;
  labels?: string[];
  body?: string;
  message_id?: string;
}

interface InboxData {
  totalEmails: number;
  needsAttention: number;
  categorized: {
    urgent: number;
    fyi: number;
    archive: number;
  };
  emails?: {
    urgent: Email[];
    fyi: Email[];
    archive: Email[];
  };
  error?: string;
}

function formatDate(iso: string) {
  try {
    const date = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  } catch {
    return iso;
  }
}

function getSenderName(from: string): string {
  // Extract name from "Name <email@domain.com>" format
  const match = from.match(/^([^<]+)<[^>]+>$/);
  if (match) {
    return match[1].trim();
  }
  return from;
}

export default function InboxPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [inboxData, setInboxData] = useState<InboxData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/landing");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchEmails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchInboxEmails(user.uid);
        setInboxData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load emails");
        setInboxData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <AmbientOrbs />
      <Header />
      <AnimatePresence mode="wait">
        <motion.div
          key="/inbox"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="pt-28 pb-20 px-margin-desktop min-h-screen"
        >
          <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-headline-lg font-headline-lg font-light tracking-tighter text-primary mb-2">
            Inbox
          </h1>
          <p className="text-body-md font-body-md text-on-surface-variant">
            Your emails from the last 24 hours
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/30 text-error text-body-md">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : inboxData ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="glass-card p-4 rounded-lg">
                <div className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
                  Total Emails
                </div>
                <div className="text-display-lg font-display-lg text-primary">
                  {inboxData.totalEmails}
                </div>
              </div>
              <div className="glass-card p-4 rounded-lg">
                <div className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
                  Needs Attention
                </div>
                <div className="text-display-lg font-display-lg text-error">
                  {inboxData.needsAttention}
                </div>
              </div>
              <div className="glass-card p-4 rounded-lg">
                <div className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
                  FYI
                </div>
                <div className="text-display-lg font-display-lg text-secondary">
                  {inboxData.categorized.fyi}
                </div>
              </div>
              <div className="glass-card p-4 rounded-lg">
                <div className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
                  Archive
                </div>
                <div className="text-display-lg font-display-lg text-on-surface-variant">
                  {inboxData.categorized.archive}
                </div>
              </div>
            </div>

            {/* Email Lists */}
            {inboxData.emails && (
              <>
                {/* Urgent Section */}
                {inboxData.emails.urgent.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-headline-lg font-headline-lg font-light tracking-tighter text-error mb-4">
                      Urgent ({inboxData.emails.urgent.length})
                    </h2>
                    <div className="space-y-2">
                      {inboxData.emails.urgent.map((email) => (
                        <EmailRow
                          key={email.id}
                          email={email}
                          isExpanded={expandedId === email.id}
                          onToggle={() =>
                            setExpandedId(expandedId === email.id ? null : email.id)
                          }
                          category="urgent"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* FYI Section */}
                {inboxData.emails.fyi.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-headline-lg font-headline-lg font-light tracking-tighter text-secondary mb-4">
                      FYI ({inboxData.emails.fyi.length})
                    </h2>
                    <div className="space-y-2">
                      {inboxData.emails.fyi.map((email) => (
                        <EmailRow
                          key={email.id}
                          email={email}
                          isExpanded={expandedId === email.id}
                          onToggle={() =>
                            setExpandedId(expandedId === email.id ? null : email.id)
                          }
                          category="fyi"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Archive Section */}
                {inboxData.emails.archive.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-headline-lg font-headline-lg font-light tracking-tighter text-on-surface-variant mb-4">
                      Archive ({inboxData.emails.archive.length})
                    </h2>
                    <div className="space-y-2">
                      {inboxData.emails.archive.map((email) => (
                        <EmailRow
                          key={email.id}
                          email={email}
                          isExpanded={expandedId === email.id}
                          onToggle={() =>
                            setExpandedId(expandedId === email.id ? null : email.id)
                          }
                          category="archive"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {inboxData.totalEmails === 0 && (
              <div className="glass-card p-12 rounded-lg text-center">
                <p className="text-body-md font-body-md text-on-surface-variant">
                  No emails from the last 24 hours
                </p>
              </div>
            )}
          </>
        ) : null}
          </div>
        </motion.div>
      </AnimatePresence>
      <Footer />
    </>
  );
}

interface EmailRowProps {
  email: Email;
  isExpanded: boolean;
  onToggle: () => void;
  category: "urgent" | "fyi" | "archive";
}

function EmailRow({ email, isExpanded, onToggle, category }: EmailRowProps) {
  const categoryColors = {
    urgent: "border-l-4 border-l-error",
    fyi: "border-l-4 border-l-secondary",
    archive: "border-l-4 border-l-on-surface-variant/30",
  };

  return (
    <div
      className={`glass-card rounded-lg overflow-hidden transition-all ${categoryColors[category]} cursor-pointer hover:bg-white/50`}
      onClick={onToggle}
    >
      <div className="p-4">
        {/* Email Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-body-md font-semibold text-primary truncate">
                {getSenderName(email.from)}
              </p>
              <span className="text-label-sm text-on-surface-variant flex-shrink-0">
                {formatDate(email.timestamp)}
              </span>
            </div>
            <p className="text-body-md font-body-md text-primary mb-2 truncate">
              {email.subject || "(no subject)"}
            </p>
            <p className="text-body-md font-body-md text-on-surface-variant line-clamp-2">
              {email.snippet}
            </p>
          </div>
          <div className="flex-shrink-0 text-on-surface-variant">
            <span className="text-2xl">
              {isExpanded ? "−" : "+"}
            </span>
          </div>
        </div>

        {/* Expanded Body */}
        {isExpanded && email.body && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-body-md font-body-md text-on-surface whitespace-pre-wrap break-words">
              {email.body.substring(0, 500)}
              {email.body.length > 500 && "..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
