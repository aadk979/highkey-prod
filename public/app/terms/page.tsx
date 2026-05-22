import React from "react"
import { motion } from "framer-motion"

export const metadata = {
  title: "Terms of Use | Highkey",
  description: "Terms of Use for Highkey Storefront",
}

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-[800px] mx-auto">
          <h1 className="font-heading font-light text-4xl md:text-5xl text-foreground mb-4">
            Terms of Use
          </h1>
          <p className="text-muted text-sm mb-12">Effective Date: May 2026</p>

          <div className="prose prose-sm md:prose-base prose-neutral dark:prose-invert max-w-none text-foreground/80">
            <p>
              These Terms of Use govern access to and use of this website and any orders placed through it. By using this website, you agree to these Terms of Use.
            </p>

            <h3 className="text-foreground font-medium mt-8 mb-4">1. Website Ownership and Licence</h3>
            <p>
              During the first contract year between the developer and the client, the website codebase and related development work are owned by the developer, not HighKey. During that period, HighKey is granted the right to use the website for its business operations in accordance with the developer-client agreement. Ownership of the codebase transfers only if and when the applicable contract provides for that transfer after the first contract year. Except to the extent expressly granted under a separate written agreement, no person may copy, reproduce, distribute, modify, reverse engineer, or create derivative works from the website, codebase, or related materials.
            </p>

            <h3 className="text-foreground font-medium mt-8 mb-4">2. Service Area</h3>
            <p>
              This storefront is intended only for customers in Singapore. Orders that are outside Singapore, or that appear to fall outside the intended service area, may be rejected, cancelled, or refunded.
            </p>

            <h3 className="text-foreground font-medium mt-8 mb-4">3. Orders and Checkout</h3>
            <p>
              The website may collect and transmit order-related information in order to generate quotes, calculate totals, apply promotions, and create orders. An order is not accepted merely because information has been submitted through the website. Order acceptance remains subject to review and confirmation.
            </p>

            <h3 className="text-foreground font-medium mt-8 mb-4">4. Payments</h3>
            <p>
              Payments may be processed through Stripe-hosted checkout or another Stripe-operated payment flow. This website frontend does not collect payment card details directly.
            </p>

            <h3 className="text-foreground font-medium mt-8 mb-4">5. Product Information and Customisation</h3>
            <p>
              Product descriptions, visuals, and customization tools are provided for general informational and ordering purposes. Final products, especially customised products, may vary slightly from on-screen previews due to production, display, or material differences. You are responsible for reviewing your order details and customization selections before completing checkout.
            </p>

            <h3 className="text-foreground font-medium mt-8 mb-4">6. Refusal, Cancellation, and Refunds</h3>
            <p>
              We may refuse or cancel orders where reasonably necessary, including where:
            </p>
            <ul className="list-disc pl-5 mt-2 mb-4 space-y-1">
              <li>the order is outside Singapore;</li>
              <li>required information is inaccurate or incomplete;</li>
              <li>there is a pricing, listing, or technical error; or</li>
              <li>misuse, suspected fraud, or abuse is identified.</li>
            </ul>
            <p>
              If an order is cancelled after payment, an appropriate refund may be issued. For refund requests or order disputes, contact:
            </p>
            <ul className="list-none mt-2 mb-4">
              <li>Email: <a href="mailto:highkeychains@gmail.com" className="text-primary hover:underline">highkeychains@gmail.com</a></li>
              <li>Instagram: <a href="https://instagram.com/highkeyofficialsg" target="_blank" rel="noreferrer" className="text-primary hover:underline">@highkeyofficialsg</a></li>
            </ul>

            <h3 className="text-foreground font-medium mt-8 mb-4">7. Self-Collection and Delivery</h3>
            <p>
              Where self-collection is offered, you are responsible for collecting the order in accordance with any collection instructions provided. Where delivery is offered, you are responsible for providing accurate delivery and contact details.
            </p>

            <h3 className="text-foreground font-medium mt-8 mb-4">8. Order Lookup and Security</h3>
            <p>
              If the website provides order lookup through a token, link, or similar identifier, you are responsible for keeping that information secure. A person with access to a valid lookup token or link may be able to view associated order information.
            </p>

            <h3 className="text-foreground font-medium mt-8 mb-4">9. Acceptable Use</h3>
            <p>
              You must not:
            </p>
            <ul className="list-disc pl-5 mt-2 mb-4 space-y-1">
              <li>use the website for unlawful, fraudulent, or abusive purposes;</li>
              <li>interfere with the operation or security of the website;</li>
              <li>attempt unauthorised access to systems or data; or</li>
              <li>misuse promotions, pricing, or ordering functions.</li>
            </ul>

            <h3 className="text-foreground font-medium mt-8 mb-4">10. Intellectual Property</h3>
            <p>
              All content, materials, features, functionality, software, designs, text, graphics, images, branding, and other content made available on or through the website may be owned by HighKey, the developer, or relevant licensors, depending on the nature of the asset and the applicable rights during the relevant period. Except as expressly permitted in writing by the relevant rights holder, no part of the website or its contents may be copied, reproduced, distributed, modified, reverse engineered, republished, uploaded, posted, transmitted, or otherwise exploited. Your access to or use of the website does not transfer any ownership rights in the website or its contents.
            </p>

            <h3 className="text-foreground font-medium mt-8 mb-4">11. Availability and Disclaimer</h3>
            <p>
              The website is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis to the extent permitted by law. No guarantee is made that the website will be uninterrupted, error-free, or that all content will always be complete, current, or free from technical issues.
            </p>

            <h3 className="text-foreground font-medium mt-8 mb-4">12. Limitation of Liability</h3>
            <p>
              To the maximum extent permitted by law, liability for indirect, incidental, special, or consequential loss arising from use of the website may be excluded. Nothing in these Terms of Use excludes liability that cannot lawfully be excluded.
            </p>

            <h3 className="text-foreground font-medium mt-8 mb-4">13. Changes to these Terms</h3>
            <p>
              These Terms of Use may be updated from time to time by posting a revised version on the website.
            </p>

            <h3 className="text-foreground font-medium mt-8 mb-4">14. Governing Law</h3>
            <p>
              These Terms of Use are governed by the laws of Singapore.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
