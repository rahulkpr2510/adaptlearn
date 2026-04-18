"use client"

import { motion } from "motion/react"

const TESTIMONIALS = [
  {
    quote: "The adaptive system identified gaps in my DSA knowledge I didn't even know I had. Landed my dream job at a FAANG company!",
    author: "Sarah Chen",
    role: "Software Engineer",
    company: "Meta",
  },
  {
    quote: "After struggling with SQL for months, AdaptLearn's targeted approach helped me master complex queries in just 3 weeks.",
    author: "Marcus Johnson",
    role: "Data Engineer",
    company: "Stripe",
  },
  {
    quote: "The streak system kept me accountable. 45 days in and I've never felt more confident about technical interviews.",
    author: "Priya Patel",
    role: "Frontend Developer",
    company: "Vercel",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 border-t border-line bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
      <div className="page-shell">
        <div className="text-center mb-16">
          <span className="section-eyebrow">Testimonials</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold">
            Loved by developers worldwide
          </h2>
          <p className="mt-4 text-lg text-ink-soft max-w-2xl mx-auto">
            Join thousands of learners who have transformed their interview preparation
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="card-surface p-6"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              
              <p className="text-foreground mb-6">{`"${testimonial.quote}"`}</p>
              
              <div className="flex items-center gap-3 pt-4 border-t border-line">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand/30 to-brand/10 flex items-center justify-center text-sm font-semibold">
                  {testimonial.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium text-sm">{testimonial.author}</p>
                  <p className="text-xs text-ink-soft">{testimonial.role} at {testimonial.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
