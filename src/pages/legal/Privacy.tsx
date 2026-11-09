const sectionClass = "rounded-3xl border border-white/10 bg-white/[0.04] p-6";

export default function Privacy() {
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-16 text-white">
      <article className="mx-auto max-w-4xl space-y-6">
        <header>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Ocean Tide Drop AI SURFER</p>
          <h1 className="mt-3 text-5xl font-black">Privacy Policy</h1>
          <p className="mt-4 text-slate-300">Effective September 13, 2026</p>
        </header>

        <section className={sectionClass}><h2 className="text-2xl font-black">Data We Collect</h2><p className="mt-3 leading-7 text-slate-300">We may collect contact details, business information, website URLs, audit answers, service requests, support messages, account information, and technical logs needed to provide and secure our services.</p></section>
        <section className={sectionClass}><h2 className="text-2xl font-black">How We Use Data</h2><p className="mt-3 leading-7 text-slate-300">We use information to deliver AI Wave Checks, audits, customer deliverables, account access, implementation services, support, billing, security, product improvement, and legally required recordkeeping.</p></section>
        <section className={sectionClass}><h2 className="text-2xl font-black">Payment Information</h2><p className="mt-3 leading-7 text-slate-300">Payments are processed through Stripe. We do not store complete payment-card numbers or card security codes. We may retain transaction, invoice, payment-status, and accounting records needed for operations, fraud prevention, tax, and legal compliance.</p></section>
        <section className={sectionClass}><h2 className="text-2xl font-black">Service Providers</h2><p className="mt-3 leading-7 text-slate-300">We may use trusted service providers for hosting, authentication, payments, email, analytics, security, automation, and AI functionality. These providers process information only as needed to perform their services or meet their own legal obligations.</p></section>
        <section className={sectionClass}><h2 className="text-2xl font-black">Data Retention</h2><ul className="mt-3 list-disc space-y-2 pl-6 text-slate-300"><li>Leads and conversations: 12 months after last activity.</li><li>Audit reports and customer deliverables: 24 months.</li><li>Support and handoff records: 24 months.</li><li>Security logs: 12 months.</li><li>Payment and accounting records: up to seven years, excluding complete card data.</li><li>Deleted-account customer-facing data: targeted for removal within 30 days, with backups expiring within an additional 30 days.</li></ul></section>
        <section className={sectionClass}><h2 className="text-2xl font-black">Deletion Requests</h2><p className="mt-3 leading-7 text-slate-300">We honor verified deletion requests unless limited retention is required for legal, tax, fraud-prevention, security, or payment-record obligations. Requests can be sent to oceantidedropservice@gmail.com.</p></section>
        <section className={sectionClass}><h2 className="text-2xl font-black">Security</h2><p className="mt-3 leading-7 text-slate-300">We use reasonable technical and operational safeguards designed to protect customer information. No online service can guarantee absolute security, so customers should also protect their credentials and devices.</p></section>
        <section className={sectionClass}><h2 className="text-2xl font-black">Your Choices</h2><p className="mt-3 leading-7 text-slate-300">You may contact us to request access, correction, or deletion of personal information, subject to verification and applicable legal limits. You may also unsubscribe from promotional messages where offered.</p></section>
        <section className={sectionClass}><h2 className="text-2xl font-black">Contact</h2><p className="mt-3 leading-7 text-slate-300">Privacy questions and requests: oceantidedropservice@gmail.com.</p></section>
      </article>
    </main>
  );
}
