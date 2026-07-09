'use client';

import { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// ── SETUP ───────────────────────────────────────────────────────────────────
// 1. Sign up at formspree.io
// 2. Create a new form and copy the form ID
// 3. Replace YOUR_FORM_ID below with your actual form ID
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
const EMAIL = 'mateopollonistudio@gmail.com';

type Status = 'idle' | 'sending' | 'success' | 'error';

interface FormState {
  business: string;
  goals: string;
  projectType: string;
  branding: string;
  admire: string;
  timeline: string;
  functionality: string;
  vision: string;
  name: string;
  email: string;
}

const EMPTY: FormState = {
  business: '', goals: '', projectType: '', branding: '',
  admire: '', timeline: '', functionality: '', vision: '', name: '', email: '',
};

const ease = [0.16, 1, 0.3, 1] as const;

/* ── Pill selector ── */
function Pills({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(value === opt ? '' : opt)}
          className={`font-sans text-[9px] tracking-[0.16em] uppercase px-4 py-2.5 border transition-all duration-300 ${
            value === opt
              ? 'border-[#F0EDE8]/[0.7] text-[#F0EDE8] bg-[#F0EDE8]/[0.06]'
              : 'border-[#F0EDE8]/[0.12] text-[#F0EDE8]/[0.4] hover:border-[#F0EDE8]/[0.3] hover:text-[#F0EDE8]/[0.65]'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

/* ── Field wrapper ── */
function Field({ label, children, uid }: { label: string; children: React.ReactNode; uid?: string }) {
  return (
    <div className="flex flex-col gap-3">
      <label htmlFor={uid} className="font-sans text-[9px] tracking-[0.28em] uppercase text-[#F0EDE8]/[0.4]">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full bg-transparent font-sans text-[15px] text-[#F0EDE8] ' +
  'border-0 border-b border-[#F0EDE8]/[0.12] ' +
  'focus:border-[#F0EDE8]/[0.5] ' +
  'outline-none ring-0 pb-3 pt-1 transition-colors duration-300 ' +
  'placeholder:text-[#F0EDE8]/[0.18]';

/* ── Success state ── */
function SuccessState() {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease }}
      className="min-h-screen bg-[#080808] flex flex-col items-center justify-center px-8 text-center gap-8"
    >
      {/* Ambient glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60vw', height: '60vh',
          background: 'radial-gradient(ellipse, rgba(216,196,128,0.07) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="font-sans text-[11px] tracking-[0.22em] uppercase text-[#F0EDE8]/[0.35]"
      >
        Sent
      </motion.p>

      <h1
        className="font-display font-semibold text-[#F0EDE8] relative"
        style={{ fontSize: 'clamp(52px, 7vw, 112px)', letterSpacing: '-0.03em', lineHeight: 1.02 }}
      >
        <motion.span
          className="block"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease }}
        >
          It&apos;s on its way.
        </motion.span>
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35, ease }}
        className="font-sans text-[15px] leading-[1.8] text-[#F0EDE8]/[0.45] max-w-xs"
      >
        I read every inquiry personally. You&apos;ll hear from me within 48 hours.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.55 }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-sans text-[9px] tracking-[0.26em] uppercase text-[#F0EDE8]/[0.4] hover:text-[#F0EDE8] transition-colors duration-300"
        >
          ← Back to home
        </Link>
      </motion.div>
    </motion.div>
  );
}

/* ── Main page ── */
export default function InquiryPage() {
  const { t } = useLanguage();
  const f = t.inquiry.fields;
  const s = t.inquiry.sidebar;

  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<Status>('idle');

  const uid = useId();
  const set = (key: keyof FormState) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') return <SuccessState />;

  /* ── Word to italicize in heading line 2 ── */
  const line2 = t.inquiry.heading[1];
  const accentWord = line2.split(' ')[0];
  const restOfLine2 = line2.substring(accentWord.length);

  return (
    <div className="min-h-screen bg-[#080808] relative overflow-hidden">
      {/* Ambient warm glow — behind everything */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: 0, left: '50%',
          transform: 'translateX(-50%)',
          width: '90vw', height: '70vh',
          background: 'radial-gradient(ellipse at 50% 30%, rgba(216,196,128,0.065) 0%, rgba(140,120,180,0.025) 45%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* ── Opening hero ── */}
      <section className="relative pt-44 pb-24 md:pb-32 px-8 md:px-14">
        <div className="max-w-7xl mx-auto">
          {/* Label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4 mb-16 md:mb-20"
          >
            <div className="w-5 h-px bg-[#F0EDE8]/[0.2]" />
            <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-[#F0EDE8]/[0.38]">
              {t.inquiry.label}
            </span>
          </motion.div>

          {/* Heading */}
          <h1
            className="font-display font-semibold text-[#F0EDE8]"
            style={{ fontSize: 'clamp(44px, 6vw, 96px)', letterSpacing: '-0.03em', lineHeight: 1.02 }}
          >
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.08, ease }}
            >
              {t.inquiry.heading[0]}
            </motion.span>
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.18, ease }}
            >
              <em
                className="not-italic"
                style={{ color: '#d8c480' }}
              >
                {accentWord}
              </em>
              {restOfLine2}
            </motion.span>
          </h1>
        </div>
      </section>

      {/* ── Two-column form area ── */}
      <section className="relative px-8 md:px-14 pb-32 md:pb-48">
        <div className="max-w-7xl mx-auto">

          {/* Divider */}
          <div className="w-full h-px bg-[#F0EDE8]/[0.06] mb-16 md:mb-20" />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 lg:gap-20 items-start">

            {/* ── Left panel (sticky) ── */}
            <motion.aside
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.85, delay: 0.3, ease }}
              className="lg:col-span-2 lg:sticky lg:top-28 flex flex-col gap-10"
            >
              <div>
                <p className="font-sans text-[9px] tracking-[0.28em] uppercase text-[#F0EDE8]/[0.35] mb-8">
                  {s.label}
                </p>

                <ul className="flex flex-col">
                  {s.items.map((item, i) => (
                    <li key={i} className="py-6 border-t border-[#F0EDE8]/[0.06] first:border-t-0 flex flex-col gap-2">
                      <span className="font-sans text-[12px] md:text-[13px] text-[#F0EDE8]/[0.85]">
                        {item.title}
                      </span>
                      <span className="font-sans text-[12px] leading-[1.75] text-[#F0EDE8]/[0.38]">
                        {item.body}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="font-sans text-[12px] leading-[1.85] text-[#F0EDE8]/[0.32] border-t border-[#F0EDE8]/[0.06] pt-6">
                {s.note}
              </p>

              <a
                href={`mailto:${EMAIL}`}
                className="font-sans text-[10px] tracking-[0.04em] text-[#F0EDE8]/[0.2] hover:text-[#F0EDE8]/[0.5] transition-colors duration-300 -mt-2"
              >
                {EMAIL}
              </a>
            </motion.aside>

            {/* ── Right: the form ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.42, ease }}
              className="lg:col-span-3"
            >
              <AnimatePresence mode="wait">
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-14"
                >
                  <Field label={f.business.label} uid={`${uid}-business`}>
                    <input
                      id={`${uid}-business`}
                      type="text"
                      value={form.business}
                      onChange={(e) => set('business')(e.target.value)}
                      placeholder={f.business.placeholder}
                      className={inputClass}
                    />
                  </Field>

                  <Field label={f.goals.label}>
                    <textarea
                      value={form.goals}
                      onChange={(e) => set('goals')(e.target.value)}
                      placeholder={f.goals.placeholder}
                      rows={2}
                      className={`${inputClass} resize-none`}
                    />
                  </Field>

                  <Field label={f.projectType.label}>
                    <Pills
                      options={f.projectType.options}
                      value={form.projectType}
                      onChange={set('projectType')}
                    />
                  </Field>

                  <Field label={f.branding.label}>
                    <Pills
                      options={f.branding.options}
                      value={form.branding}
                      onChange={set('branding')}
                    />
                  </Field>

                  <Field label={f.admire.label}>
                    <input
                      type="text"
                      value={form.admire}
                      onChange={(e) => set('admire')(e.target.value)}
                      placeholder={f.admire.placeholder}
                      className={inputClass}
                    />
                  </Field>

                  <Field label={f.timeline.label}>
                    <Pills
                      options={f.timeline.options}
                      value={form.timeline}
                      onChange={set('timeline')}
                    />
                  </Field>

                  <Field label={f.functionality.label}>
                    <input
                      type="text"
                      value={form.functionality}
                      onChange={(e) => set('functionality')(e.target.value)}
                      placeholder={f.functionality.placeholder}
                      className={inputClass}
                    />
                  </Field>

                  <Field label={f.vision.label}>
                    <textarea
                      value={form.vision}
                      onChange={(e) => set('vision')(e.target.value)}
                      placeholder={f.vision.placeholder}
                      rows={6}
                      className={`${inputClass} resize-none`}
                    />
                  </Field>

                  {/* Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 sm:gap-8">
                    <Field label={f.name.label} uid={`${uid}-name`}>
                      <input
                        id={`${uid}-name`}
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => set('name')(e.target.value)}
                        placeholder={f.name.placeholder}
                        className={inputClass}
                      />
                    </Field>
                    <Field label={f.email.label} uid={`${uid}-email`}>
                      <input
                        id={`${uid}-email`}
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => set('email')(e.target.value)}
                        placeholder={f.email.placeholder}
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  {/* Submit */}
                  <div className="pt-4 border-t border-[#F0EDE8]/[0.06]">
                    {status === 'error' && (
                      <p className="font-sans text-[11px] text-red-400/80 mb-6">
                        Something went wrong — email me at {EMAIL}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="group relative inline-flex items-center gap-3 font-sans text-[11px] tracking-[0.26em] uppercase text-[#F0EDE8] disabled:opacity-40 transition-opacity duration-300"
                    >
                      <span className="relative">
                        <span className="border-b border-[#F0EDE8]/[0.35] pb-px group-hover:border-[#F0EDE8] transition-colors duration-300">
                          {status === 'sending' ? '···' : t.inquiry.submit}
                        </span>
                      </span>
                      {status !== 'sending' && (
                        <svg
                          width="12" height="12"
                          viewBox="0 0 11 11"
                          fill="none" stroke="currentColor"
                          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                          className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"
                        >
                          <path d="M1.5 9.5 9.5 1.5M9.5 1.5H3.5M9.5 1.5V7.5" />
                        </svg>
                      )}
                    </button>

                    <p className="font-sans text-[10px] tracking-[0.04em] text-[#F0EDE8]/[0.2] mt-5">
                      {t.inquiry.successBody}
                    </p>
                  </div>
                </motion.form>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
