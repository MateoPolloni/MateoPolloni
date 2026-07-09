'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// ── SETUP ───────────────────────────────────────────────────────────────────
// 1. Sign up at formspree.io using your email address
// 2. Create a new form and copy the form ID (looks like "xpwzabcd")
// 3. Replace YOUR_FORM_ID below with your actual form ID
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

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

function OptionPills({
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
          className={`font-sans text-[10px] tracking-[0.14em] uppercase px-4 py-2.5 border transition-all duration-300 ${
            value === opt
              ? 'border-[#0A0A0A] dark:border-[#F0EDE8] text-[#0A0A0A] dark:text-[#F0EDE8]'
              : 'border-black/15 dark:border-white/15 text-[#7A7A7A] dark:text-[#6B6B6B] hover:border-black/30 dark:hover:border-white/30'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <label className="font-sans text-[9px] tracking-[0.28em] uppercase text-[#7A7A7A] dark:text-[#6B6B6B]">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full bg-transparent font-sans text-[15px] text-[#0A0A0A] dark:text-[#F0EDE8] ' +
  'border-0 border-b border-black/20 dark:border-white/15 ' +
  'focus:border-[#0A0A0A] dark:focus:border-[#F0EDE8] ' +
  'outline-none ring-0 pb-3 pt-1 transition-colors duration-300 ' +
  'placeholder:text-[#B0ADB8] dark:placeholder:text-[#3A3A3A]';

export default function Inquiry() {
  const { t } = useLanguage();
  const f = t.inquiry.fields;

  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<Status>('idle');

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

  return (
    <section
      id="inquiry"
      className="px-8 md:px-14 py-40 md:py-56 border-t border-black/[0.06] dark:border-white/[0.04]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section label with marker */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-16 md:mb-20"
        >
          <div className="w-5 h-px bg-[#7A7A7A] dark:bg-[#6B6B6B] opacity-40" />
          <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-[#7A7A7A] dark:text-[#6B6B6B]">
            {t.inquiry.label}
          </span>
        </motion.div>

        <h2
          className="font-display font-semibold text-[#0A0A0A] dark:text-[#F0EDE8]"
          style={{ fontSize: 'clamp(36px, 4.5vw, 72px)', letterSpacing: '-0.03em', lineHeight: 1.08 }}
        >
          {t.inquiry.heading.map((line, i) => (
            <motion.span
              key={i}
              className="block"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.05 + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
            >
              {line}
            </motion.span>
          ))}
        </h2>

        <div className="mt-16 md:mt-20 max-w-2xl">
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="py-20 flex flex-col gap-4"
              >
                <h3
                  className="font-display font-semibold text-[#0A0A0A] dark:text-[#F0EDE8]"
                  style={{ fontSize: 'clamp(32px, 3.5vw, 52px)', letterSpacing: '-0.025em', lineHeight: 1.1 }}
                >
                  {t.inquiry.successTitle}
                </h3>
                <p className="font-sans text-[14px] md:text-[15px] leading-[1.85] text-[#7A7A7A] dark:text-[#6B6B6B]">
                  {t.inquiry.successBody}
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="flex flex-col gap-12"
              >
                <Field label={f.business.label}>
                  <input
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
                  <OptionPills
                    options={f.projectType.options}
                    value={form.projectType}
                    onChange={set('projectType')}
                  />
                </Field>

                <Field label={f.branding.label}>
                  <OptionPills
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
                  <OptionPills
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
                    rows={5}
                    className={`${inputClass} resize-none`}
                  />
                </Field>

                {/* Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-8">
                  <Field label={f.name.label}>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => set('name')(e.target.value)}
                      placeholder={f.name.placeholder}
                      className={inputClass}
                    />
                  </Field>
                  <Field label={f.email.label}>
                    <input
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
                <div className="pt-2">
                  {status === 'error' && (
                    <p className="font-sans text-[11px] text-red-500 mb-4">
                      Something went wrong — email me at mateopollonistudio@gmail.com
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="inline-flex items-center gap-2.5 font-sans text-[10px] tracking-[0.28em] uppercase text-[#0A0A0A] dark:text-[#F0EDE8] hover:opacity-50 transition-opacity duration-300 disabled:opacity-40"
                  >
                    <span className="border-b border-current pb-px">
                      {status === 'sending' ? '...' : t.inquiry.submit}
                    </span>
                    {status !== 'sending' && (
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1.5 9.5 9.5 1.5M9.5 1.5H3.5M9.5 1.5V7.5" />
                      </svg>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
