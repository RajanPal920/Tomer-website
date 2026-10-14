import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { faqs } from '../data/faqs';

export default function FaqSection() {
  const [openFaqId, setOpenFaqId] = useState('faq-1');

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <section id="faqs" className="py-20 sm:py-24 bg-ivory">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brandRed mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-brandRed" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal font-normal tracking-tight text-balance mb-4">
            Answers to Common Property Inquiries
          </h2>
          <p className="text-muted text-base leading-relaxed text-balance">
            Clear, straightforward answers about property discovery, localities, and consultation with Tomar Enterprises.
          </p>
        </div>

        {/* Accordion Container */}
        <div className="space-y-3.5" role="region" aria-label="Frequently Asked Questions">
          {faqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-lg border border-stone/80 overflow-hidden shadow-subtle transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                  className="w-full py-4.5 px-5 sm:px-6 flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-royal group"
                >
                  <span className="font-serif text-base sm:text-lg text-charcoal group-hover:text-navy transition-colors pr-4">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                      isOpen
                        ? 'bg-brandRed text-white rotate-180'
                        : 'bg-ivory text-muted group-hover:bg-stone/50'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${faq.id}`}
                    className="px-5 sm:px-6 pb-5 pt-1 text-sm text-charcoal/80 leading-relaxed border-t border-stone/40 bg-ivory/30 animate-fadeIn"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
