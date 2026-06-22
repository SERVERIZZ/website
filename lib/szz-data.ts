import type { TerminalLine } from "@/components/szz/terminal";

export const heroLines: TerminalLine[] = [
  { type: "command", text: "serverizz launch mybakery.com" },
  { type: "spinner", text: "Setting up hosting, email & SSL…" },
  { type: "success", text: "Mailbox ready: hello@mybakery.com" },
  { type: "success", text: "Site live — daily backups on, SSL issued" },
  { type: "comment", text: "your coffee isn’t even cold yet" },
];

export const wpLines: TerminalLine[] = [
  { type: "command", text: "serverizz wp install --site mybakery.com" },
  { type: "spinner", text: "Installing WordPress + caching…" },
  { type: "success", text: "WordPress 6.x ready · SSL issued" },
  { type: "success", text: "Daily backups + auto-updates enabled" },
  { type: "comment", text: "log in at /wp-admin — we’ll keep it patched" },
];

export const rsLines: TerminalLine[] = [
  { type: "command", text: "whm create-acct --domain clientsite.com --plan starter" },
  { type: "spinner", text: "Provisioning cPanel account…" },
  { type: "success", text: "Account live · AutoSSL issued" },
  { type: "success", text: "Nameservers: ns1.yourbrand.com" },
  { type: "comment", text: "your client never sees serverizz" },
];
