import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { PricingPreview } from "@/components/landing/pricing-preview"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { CTASection } from "@/components/landing/cta-section"

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="flex-1">
      <HeroSection isLoggedIn={!!user} />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingPreview />
      <TestimonialsSection />
      <CTASection isLoggedIn={!!user} />
    </main>
  )
}
