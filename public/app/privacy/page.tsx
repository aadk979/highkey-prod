import React from "react"
import { motion } from "framer-motion"

export const metadata = {
  title: "Privacy Policy | Highkey",
  description: "Privacy Policy for Highkey Storefront",
}

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-[800px] mx-auto">
          <h1 className="font-heading font-light text-4xl md:text-5xl text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted text-sm mb-12">Effective Date: May 2026</p>

          <div className="prose prose-sm md:prose-base prose-neutral dark:prose-invert max-w-none text-foreground/80">
            <p>
              This Privacy Policy explains how HighKey collects, uses, discloses, and protects personal data when you use this website or place an order through it. By using this website, you acknowledge this Privacy Policy.
            </p>

            <h3 className="text-foreground font-medium mt-8 mb-4">1. Operator</h3>
            <p>
              This website is operated for the HighKey storefront. For privacy-related questions, refund requests, or order disputes, you may contact:
            </p>
            <ul className="list-none mt-2 mb-4">
              <li>Email: <a href="mailto:highkeychains@gmail.com" className="text-primary hover:underline">highkeychains@gmail.com</a></li>
              <li>Instagram: <a href="https://instagram.com/highkeyofficialsg" target="_blank" rel="noreferrer" className="text-primary hover:underline">@highkeyofficialsg</a></li>
            </ul>

            <h3 className="text-foreground font-medium mt-8 mb-4">2. Personal Data We Collect</h3>
            <p>
              We may collect the following personal data when you use the website or place an order:
            </p>
            <ul className="list-disc pl-5 mt-2 mb-4 space-y-1">
              <li>Full name</li>
              <li>Email address</li>
              <li>Country code and phone number</li>
              <li>Delivery address, where delivery is selected</li>
              <li>Selected self-collection location, where self-collection is selected</li>
              <li>Customer note or order note, if submitted</li>
              <li>Product selections, including product identifiers and quantities</li>
              <li>Selected promotion information, where applicable</li>
              <li>Customization information submitted as part of a product order</li>
              <li>Order lookup token used to retrieve order details</li>
            </ul>

            <h3 className="text-foreground font-medium mt-8 mb-4">3. How We Use Personal Data</h3>
            <p>
              We may collect, use, and disclose personal data for purposes reasonably related to operating the storefront, including to:
            </p>
            <ul className="list-disc pl-5 mt-2 mb-4 space-y-1">
              <li>process quote requests and orders;</li>
              <li>calculate totals and apply promotions;</li>
              <li>arrange delivery or self-collection;</li>
              <li>create, manage, and retrieve orders;</li>
              <li>respond to customer enquiries, refund requests, and disputes;</li>
              <li>maintain, troubleshoot, and improve website functionality; and</li>
              <li>comply with legal or regulatory requirements.</li>
            </ul>

            <h3 className="text-foreground font-medium mt-8 mb-4">4. Payments</h3>
            <p>
              Payment card details are not collected by this website frontend. When you proceed to payment, you may be redirected to a Stripe-hosted checkout page or other payment service flow operated by Stripe. Payment processing is handled by Stripe under Stripe&apos;s own terms and privacy practices.
            </p>

            <h3 className="text-foreground font-medium mt-8 mb-4">5. Browser Storage and Technical Data</h3>
            <p>
              The website uses limited client-side storage to support core functionality. This may include locally stored cart data and customization session data on your device. This storage is used to support shopping cart persistence and product customization flows. It is not intended to store payment card details.
            </p>
            <p>
              Temporary in-memory application state may also be used while you interact with the website. Such temporary state is generally not persisted unless explicitly saved through the website&apos;s functionality.
            </p>

            <h3 className="text-foreground font-medium mt-8 mb-4">6. Cookies</h3>
            <p>
              The customer-facing storefront does not intentionally set cookies for ordinary checkout activity based on the current implementation reviewed. If administrative or platform functions use cookies, those cookies are not part of the normal customer checkout flow.
            </p>

            <h3 className="text-foreground font-medium mt-8 mb-4">7. Disclosure of Personal Data</h3>
            <p>
              We may disclose personal data where reasonably necessary for the purposes described in this Privacy Policy, including:
            </p>
            <ul className="list-disc pl-5 mt-2 mb-4 space-y-1">
              <li>to service providers or technical providers supporting operation of the website and order flow;</li>
              <li>to payment processors such as Stripe for payment-related processing;</li>
              <li>to delivery, collection, or fulfillment partners where needed to fulfill an order; and</li>
              <li>where required or permitted by applicable law, regulation, court order, or legal process.</li>
            </ul>
            <p>We do not sell personal data.</p>

            <h3 className="text-foreground font-medium mt-8 mb-4">8. Retention</h3>
            <p>
              Personal data may be retained for as long as reasonably necessary for business, operational, contractual, dispute-resolution, accounting, or legal purposes. When personal data is no longer needed for such purposes, it may be deleted, anonymised, or securely disposed of, subject to applicable requirements.
            </p>

            <h3 className="text-foreground font-medium mt-8 mb-4">9. Accuracy and Security</h3>
            <p>
              You should ensure that the personal data you submit is accurate and complete. Reasonable measures may be used to protect personal data against unauthorised access, collection, use, disclosure, copying, modification, disposal, or similar risks. However, no method of transmission over the Internet or electronic storage is completely secure.
            </p>

            <h3 className="text-foreground font-medium mt-8 mb-4">10. Access, Correction, and Withdrawal</h3>
            <p>
              Subject to applicable law, you may contact us to request access to personal data in our possession or control, request correction of personal data, or withdraw consent for certain uses of personal data. If consent is withdrawn, this may affect our ability to continue providing certain goods, services, or order-related functions.
            </p>

            <h3 className="text-foreground font-medium mt-8 mb-4">11. Singapore Service Limitation</h3>
            <p>
              This storefront is intended for customers in Singapore. Orders outside Singapore may be declined, cancelled, or refunded.
            </p>

            <h3 className="text-foreground font-medium mt-8 mb-4">12. Third-Party Services</h3>
            <p>
              This website may link to or rely on third-party services, including Stripe. Those third parties may have separate terms and privacy practices, and HighKey is not responsible for their independent policies or operations.
            </p>

            <h3 className="text-foreground font-medium mt-8 mb-4">13. Changes to this Policy</h3>
            <p>
              This Privacy Policy may be updated from time to time by posting the revised version on the website.
            </p>

            <h3 className="text-foreground font-medium mt-8 mb-4">14. Contact</h3>
            <p>
              For privacy-related questions, refund requests, or order disputes, contact:
            </p>
            <ul className="list-none mt-2 mb-4">
              <li>Email: <a href="mailto:highkeychains@gmail.com" className="text-primary hover:underline">highkeychains@gmail.com</a></li>
              <li>Instagram: <a href="https://instagram.com/highkeyofficialsg" target="_blank" rel="noreferrer" className="text-primary hover:underline">@highkeyofficialsg</a></li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
