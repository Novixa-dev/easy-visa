# EASY VISA

## Website Product Requirements & Developer Reference

**Document type:** Product Brief, Functional Specification, UX/UI
Direction, and Delivery Checklist\
**Project status:** Initial website build\
**Business location:** Mukalla, Hadhramaut, Republic of Yemen\
**Primary language:** English (with a required Arabic website
experience)\
**Prepared for:** Web designer / developer / development team\
**Document version:** 1.0\
**Date:** 24 November 2026

------------------------------------------------------------------------

# 1. Executive Summary

Easy Visa is a travel-services and visa-assistance business based in
Mukalla, Hadhramaut, Yemen. The business helps customers request
travel-related services through a simple, trustworthy, mobile-friendly
online experience.

The purpose of this project is to build a professional bilingual website
that does more than introduce the business. It must allow visitors to
explore services, submit structured service requests, communicate with
Easy Visa through WhatsApp, and track request progress. The business
owner must be able to manage requests, services, offers, website
content, and customer communications through a secure administration
dashboard.

The website is an **inquiry and request-management platform**. It is
not, in the first release, an automated visa-issuance platform, airline
reservation engine, hotel booking engine, accounting system, or payment
gateway.

The first release should be reliable, secure, easy for the owner to
operate, and structured so that new services and integrations can be
added later without rebuilding the system.

## Project decisions already confirmed

  -----------------------------------------------------------------------
  Decision                            Requirement
  ----------------------------------- -----------------------------------
  Request intake                      Both website forms and WhatsApp

  Online payment                      Deferred to a future phase

  Request tracking                    Both customer-facing tracking and
                                      internal admin tracking

  Languages                           Arabic and English from launch

  Primary device                      Mobile-first, while supporting
                                      desktop and tablet

  Business model                      The customer submits a request;
                                      Easy Visa staff review and process
                                      it

  Initial location                    Mukalla, Hadhramaut, Yemen
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 2. Business Overview

## 2.1 Business identity

-   **Business name:** Easy Visa
-   **Brand presentation:** Easy Visa / إيزي فيزا
-   **Business category:** Travel services, visa assistance,
    transportation reservations, flight requests, and hotel booking
    requests
-   **Location:** Mukalla, Hadhramaut, Yemen
-   **Business model:** Direct customer service supported by agents,
    suppliers, and partner providers where applicable
-   **Current stage:** Business under establishment / development

The owner will provide the original approved Easy Visa logo and any
final brand assets to the developer. Do not redraw, replace, distort, or
independently invent a different logo.

## 2.2 Business purpose

The website should help Easy Visa:

1.  Present its services professionally and clearly.
2.  Build customer confidence and communicate what the business offers.
3.  Receive structured service requests at any time.
4.  Reduce repeated manual questions by collecting relevant information
    up front.
5.  Keep requests organized in one administration dashboard.
6.  Give customers a simple way to check request progress.
7.  Make it easy to contact the office through WhatsApp, phone, and
    social media.
8.  Publish and update services, offers, prices, and announcements.
9.  Establish a foundation for future growth and integrations.

## 2.3 Brand promise and communication

The brand uses the Arabic phrase:

**"راحة . أمان"**

A previously used marketing line is:

**"رحلتك تبدأ من هنا"** --- "Your journey starts here."

Use these as optional brand copy where appropriate. Do not force every
slogan into every page. The tone should be professional, reassuring,
clear, helpful, and honest. Avoid claims that imply guaranteed visa
approval or guaranteed travel availability.

------------------------------------------------------------------------

# 3. Services and Business Scope

The following services are part of the intended business offering. Each
should have its own editable service page and an appropriate request
form.

## 3.1 Visa services

1.  **Umrah visa assistance**
    -   Umrah visa requests.
    -   The business may offer different visa types or arrangements
        depending on current availability and applicable rules.
    -   Do not assume a particular visa category, duration, eligibility
        rule, or approval outcome. These details must be configurable
        and confirmed by the business.
2.  **Family visit visa assistance**
    -   Assistance with family visit visa procedures and requests.
    -   The exact requirements may vary by applicant and applicable
        authority.
3.  **Oman visa assistance**
    -   Requests relating to visas for the Sultanate of Oman.
    -   Do not publish fixed eligibility rules or processing times
        without owner approval and verification.
4.  **Other destination visa assistance**
    -   A flexible category for visa-related requests for multiple
        countries.
    -   The administrator should be able to add destinations and service
        types without developer intervention.

## 3.2 Travel and reservation services

5.  **Air travel requests**
    -   Flight search / quotation / booking assistance requests.
    -   The website collects the customer's itinerary preferences. It
        does not issue tickets automatically in the first release.
6.  **Land transportation**
    -   Domestic and international bus or land-trip reservation
        requests.
    -   The website should collect origin, destination, travel date,
        passenger count, and relevant preferences.
7.  **Hotel booking requests**
    -   Hotel accommodation requests.
    -   The website collects destination, check-in/check-out dates,
        guests, rooms, and preferences.

## 3.3 Service content management

The administrator must be able to:

-   Add, edit, publish, unpublish, reorder, and archive services.
-   Set Arabic and English names and descriptions independently.
-   Add a service image or icon.
-   Define whether the service is currently available.
-   Configure the request form fields for each service, where
    technically practical.
-   Add requirements, notes, disclaimers, and frequently asked
    questions.
-   Set an optional displayed price, price range, or "Contact us for a
    quotation" label.
-   Select the currency for any displayed price.
-   Mark a service as featured on the homepage.

Prices, requirements, availability, and processing times must never be
hard-coded into the website. They must be editable and should only be
published after approval by Easy Visa.

------------------------------------------------------------------------

# 4. Target Users and Main User Journeys

## 4.1 Customer types

The website should serve:

-   People seeking Umrah visa assistance.
-   People seeking family visit visa assistance.
-   Travelers asking about Oman or other destination visas.
-   Customers requesting flight reservations.
-   Customers requesting domestic or international land transportation.
-   Customers requesting hotel accommodation.
-   Returning customers checking an existing request.

Do not assume every visitor is technically experienced. Forms and
instructions should be simple, readable, and usable on a mobile phone.

## 4.2 Primary customer journey

1.  Customer opens the website.
2.  Customer selects Arabic or English.
3.  Customer browses a service category or a featured service.
4.  Customer opens the service details page.
5.  Customer reviews the description, requirements, and any approved
    price information.
6.  Customer selects **Submit a Request**.
7.  Customer completes the service-specific form and uploads documents
    if requested.
8.  Customer reviews and submits the form.
9.  Website creates a unique reference number and stores the request.
10. Website displays a clear confirmation page.
11. Customer can continue to WhatsApp, with a prefilled message where
    possible.
12. The request appears in the administration dashboard.
13. Staff review the request and update its status.
14. Customer checks progress through the tracking page and/or receives a
    direct update from the office.

## 4.3 WhatsApp journey

WhatsApp is an additional intake and communication channel, not a
replacement for the website request database.

-   Place a visible WhatsApp contact action on the homepage, service
    pages, and contact page.
-   Provide a WhatsApp action on each service page.
-   Where possible, generate a prefilled message that identifies the
    service and includes the website request reference number.
-   Do not claim that a WhatsApp message has been received or stored in
    the website unless a real WhatsApp Business integration has been
    implemented and tested.
-   If a visitor contacts the office directly through WhatsApp without
    submitting a website form, staff may need to create a manual request
    record in the dashboard. This is a useful optional admin feature.

------------------------------------------------------------------------

# 5. Website Information Architecture

Recommended top-level navigation:

1.  Home
2.  Visa Services
    -   Umrah Visa
    -   Family Visit Visa
    -   Oman Visa
    -   Other Countries
3.  Travel Services
    -   Flight Reservations
    -   Land Transportation
    -   Hotels
4.  Offers
5.  About Us
6.  Track Your Request
7.  Contact Us
8.  Language switcher (Arabic / English)

Recommended footer:

-   Easy Visa logo
-   Short business description
-   Service links
-   Contact phone / WhatsApp
-   Instagram and Facebook links (only confirmed URLs should be
    published)
-   Privacy Policy
-   Terms of Service
-   Copyright notice
-   Language switcher if appropriate

The navigation labels and all page content must be translated and
editable in both languages.

------------------------------------------------------------------------

# 6. Page-by-Page Requirements

## 6.1 Homepage

The homepage should communicate the business and guide visitors to a
service or a contact action quickly.

Recommended sections:

1.  **Header**
    -   Original Easy Visa logo.
    -   Main navigation.
    -   Arabic / English language switcher.
    -   Prominent WhatsApp or contact action.
2.  **Hero section**
    -   Clear headline, such as "Your Journey Starts Here."
    -   Short description of Easy Visa's travel and visa services.
    -   Primary action: "Explore Services" or "Submit a Request."
    -   Secondary action: "Contact Us on WhatsApp."
    -   A tasteful, travel-related visual.
3.  **Featured services**
    -   Service cards for the main visa and travel categories.
    -   Each card links to its own service page.
4.  **Why choose Easy Visa**
    -   Use only truthful, owner-approved statements.
    -   Suggested themes: clear communication, organized request
        handling, convenient contact, and customer support.
    -   Do not invent years of experience, licenses, approval rates,
        partnerships, or testimonials.
5.  **Current offers**
    -   Display only active offers.
    -   Show price, currency, validity period, and terms only when
        supplied and approved by the owner.
6.  **How it works**
    -   Choose a service.
    -   Submit your request.
    -   Easy Visa reviews and contacts you.
    -   Track your request.
7.  **About Easy Visa**
    -   Short introduction and link to the About page.
8.  **Contact section**
    -   Phone / WhatsApp action.
    -   Social media links.
    -   Business location at city / region level.

## 6.2 Service listing pages

Each service category page should include:

-   Page title and short introduction.
-   Available services in that category.
-   Service cards with image or icon.
-   Brief description.
-   Optional approved price or quotation note.
-   "View Details" and "Submit a Request" actions.

## 6.3 Individual service detail page

Each service detail page should support:

-   Arabic and English title.
-   Clear description.
-   Who the service is for, if verified.
-   Requirements / documents, only when confirmed by the owner.
-   Important notes and disclaimers.
-   Optional price or quotation information.
-   Optional FAQs.
-   Request form or clear link to the form.
-   WhatsApp contact action.
-   Related services.

Avoid static, unverified visa rules. The owner must be able to update
requirements when official procedures change.

## 6.4 Offers page

The offers page should list current and previous offers.

Each offer may include:

-   Offer title.
-   Image.
-   Description.
-   Included services.
-   Price and currency.
-   Start and end dates.
-   Terms and conditions.
-   Status: draft, scheduled, active, expired, or archived.
-   Request action.

Expired offers should automatically stop appearing as active. They may
be retained in the admin area for reference.

## 6.5 About Us page

Include editable sections for:

-   Business introduction.
-   Mission and customer-service approach.
-   Services overview.
-   Location.
-   Contact details.

Do not publish unverified legal registration details, licenses, partner
logos, awards, or claims.

## 6.6 Contact page

Include:

-   Primary phone number.
-   WhatsApp link.
-   Instagram link.
-   Facebook link, if provided.
-   City / region location.
-   Contact form (optional, but recommended).
-   Business hours only after the owner confirms them.

## 6.7 Request tracking page

The customer enters:

-   Request reference number.
-   A second verification factor, such as the phone number associated
    with the request or a one-time verification code.

The page should show only safe, customer-appropriate information:

-   Reference number.
-   Service type.
-   Submission date.
-   Current status.
-   Last updated date.
-   Customer-facing status message or next action.

Do not expose internal notes, uploaded passport documents, private staff
comments, or another customer's information.

------------------------------------------------------------------------

# 7. Request Forms and Field Requirements

## 7.1 General form behavior

All forms should:

-   Be mobile-friendly and easy to complete.
-   Clearly identify required and optional fields.
-   Validate phone numbers and required information.
-   Show helpful validation messages in the active language.
-   Allow the user to review information before submission where
    practical.
-   Include a privacy notice and consent checkbox before submitting
    personal data.
-   Support secure file upload only when required.
-   Prevent accidental duplicate submissions.
-   Display a success message and unique request reference number.
-   Store the request in the database.
-   Notify the administrator of a new request (email notification is a
    recommended option; actual delivery configuration must be agreed).
-   Provide an option to continue to WhatsApp after successful
    submission.

The forms should not request unnecessary sensitive information. Collect
passport and identity documents only when genuinely required for the
selected service and only through a secure upload mechanism.

## 7.2 Umrah visa request

Suggested fields:

-   Full name.
-   Phone / WhatsApp number.
-   Nationality.
-   Number of travelers.
-   Expected travel date.
-   Requested visa type, if known.
-   Additional notes.
-   Document upload, when required and configured by the business.

The form must allow the owner to change the fields and document
requirements as procedures change.

## 7.3 Family visit visa request

Suggested fields:

-   Applicant full name.
-   Phone / WhatsApp number.
-   Nationality.
-   Number of applicants.
-   Requested service / visit type, if known.
-   Expected travel date, if relevant.
-   Additional information.
-   Document upload, when required.

Do not ask the customer to enter information that is not necessary for
the initial inquiry.

## 7.4 Oman and other-country visa request

Suggested fields:

-   Full name.
-   Phone / WhatsApp number.
-   Nationality.
-   Current country of residence (optional if relevant).
-   Destination country.
-   Purpose of travel.
-   Visa type, if known.
-   Number of travelers.
-   Expected travel date.
-   Additional notes.
-   Document upload, only if required.

The destination list should be managed by the administrator and
expandable.

## 7.5 Flight reservation request

Suggested fields:

-   Full name.
-   Phone / WhatsApp number.
-   Departure city / airport.
-   Destination city / airport.
-   Trip type: one-way or round trip.
-   Departure date.
-   Return date (conditional).
-   Number of adults.
-   Number of children.
-   Infant count, if relevant.
-   Cabin class (optional).
-   Preferred airline (optional).
-   Additional notes.

This is a request for assistance / quotation, not an instant ticket
purchase.

## 7.6 Land transportation request

Suggested fields:

-   Full name.
-   Phone / WhatsApp number.
-   Origin.
-   Destination.
-   Travel date.
-   Number of passengers.
-   Trip category: domestic or international.
-   Preferred departure time (optional).
-   Additional notes.

The administrator should be able to add or modify routes and trip
options later.

## 7.7 Hotel booking request

Suggested fields:

-   Full name.
-   Phone / WhatsApp number.
-   Destination city.
-   Hotel name (optional).
-   Check-in date.
-   Check-out date.
-   Number of rooms.
-   Number of adults.
-   Number of children (if relevant).
-   Room preference (optional).
-   Additional notes.

## 7.8 Form configuration recommendation

Prefer a reusable form builder or configurable field system over
separate hard-coded forms. At minimum, the administrator should be able
to edit labels, required status, options, and visibility for common
fields without a code change.

If a full form builder is outside the first-release budget, implement
clean, separate service forms while keeping their field definitions easy
for developers to extend.

------------------------------------------------------------------------

# 8. Request Management and Status Workflow

## 8.1 Unique request reference

Every website-submitted request must receive a unique, non-sequential or
sufficiently hard-to-guess reference number. Do not expose raw database
IDs as public tracking credentials.

Example format (illustrative only): `EV-2026-AB12CD`

The final format can be chosen by the developer.

## 8.2 Recommended statuses

-   **New:** Request received.
-   **Under Review:** Staff are checking the information.
-   **Awaiting Customer Information:** More information or documents are
    required.
-   **In Progress:** The office is processing the request.
-   **Completed:** The requested service has been completed.
-   **Rejected:** The request cannot proceed; a customer-facing
    explanation may be provided.
-   **Cancelled:** The request was cancelled.

The administrator may update the status. The system should record who
changed it and when.

## 8.3 Status history

Maintain a history containing:

-   Previous status.
-   New status.
-   Date and time.
-   Staff user who made the change.
-   Optional internal note.
-   Optional customer-visible message.

Internal notes must never be visible on the customer tracking page.

## 8.4 Admin-created requests

Recommended feature: allow authorized staff to manually create a request
received by phone, in person, or WhatsApp. Such requests should be
clearly marked as manually created and should follow the same internal
status workflow.

------------------------------------------------------------------------

# 9. Administration Dashboard

The dashboard is a core requirement, not an optional add-on.

## 9.1 Dashboard overview

Show useful summary figures:

-   Total requests.
-   New requests.
-   Requests under review.
-   Requests awaiting customer information.
-   Requests in progress.
-   Completed requests.
-   Recent requests.
-   Requests grouped by service type.

Do not display financial revenue or profit metrics unless a separate,
properly scoped financial feature is commissioned.

## 9.2 Request management

Authorized staff should be able to:

-   View and search requests.
-   Filter by status, service, date, and source.
-   Open a request detail view.
-   View submitted fields.
-   Securely view or download uploaded documents.
-   Update status.
-   Add internal notes.
-   Add customer-visible messages.
-   Record contact attempts.
-   View status history.
-   Export selected request data to CSV only if appropriate and
    protected.
-   Create a request manually when needed.

## 9.3 Customer records

A simple customer directory is recommended, based on submitted requests:

-   Customer name.
-   Phone number.
-   Previous request references.
-   Request history.

Avoid building a complex CRM in the first release. Do not collect
unrelated personal information.

## 9.4 Service and content management

The administrator should manage:

-   Services and categories.
-   Service descriptions in both languages.
-   Form field configuration where included.
-   Service availability.
-   Images and icons.
-   Homepage featured services.
-   Offers and offer validity.
-   FAQ content.
-   About page content.
-   Contact information and social links.
-   Privacy and terms content.

## 9.5 Admin roles and permissions

At minimum:

-   **Owner / Super Admin:** Full access, settings, staff accounts, and
    all requests.
-   **Staff / Operator:** Access to assigned operational functions and
    requests, without unrestricted access to critical settings.

Use role-based access control. Keep an audit log for important actions.

------------------------------------------------------------------------

# 10. Notifications and Customer Communication

## 10.1 First-release notifications

Recommended:

-   Admin notification when a new website request is received.
-   On-screen confirmation for the customer.
-   A customer-facing status message on the tracking page.
-   WhatsApp contact action with a prefilled message.

Email notifications require a configured sender account and tested
delivery. Do not assume email is configured automatically.

## 10.2 Future notification integrations

Potential later enhancements:

-   WhatsApp Business API notifications.
-   SMS notifications.
-   Email notifications to customers.
-   Automatic reminders for travel dates or visa expiry, if the business
    later commissions that workflow.

These are not required for the initial website unless separately agreed.

## 10.3 Communication history

Recommended: keep a simple internal log of customer contact attempts and
important communication notes. Do not claim that messages sent through
an external channel are automatically recorded unless an integration
actually records them.

------------------------------------------------------------------------

# 11. Bilingual Requirements: Arabic and English

Both languages are required from launch.

## 11.1 Language behavior

-   Arabic should be the default language for the initial Yemen-focused
    audience.
-   English must be available through a clear language switcher.
-   The selected language should persist during navigation.
-   Each page, service, offer, form, validation message, status label,
    and notification template must have translations.
-   Arabic layout must use RTL.
-   English layout must use LTR.
-   Mixed Arabic / English / phone / reference-number content must
    display correctly.

## 11.2 Translation quality

Do not use raw machine translation as final customer-facing content
without review. The owner should be able to edit both language versions.

## 11.3 SEO language handling

Recommended:

-   Separate language URLs or an equivalent robust localization
    structure.
-   Correct `hreflang` tags.
-   Localized page titles and meta descriptions.
-   Correct canonical URLs.
-   Search-engine-friendly service pages in both languages.

------------------------------------------------------------------------

# 12. Visual Identity and User Experience

## 12.1 Brand direction

The preferred visual direction is:

-   Premium, trustworthy, calm, and modern.
-   Navy blue, gold, and white as the main palette.
-   Use the original Easy Visa logo.
-   Use restrained accent colors.
-   Avoid overly saturated colors, excessive gradients, visual clutter,
    and crowded layouts.
-   Use authentic, high-quality travel imagery.
-   Avoid generic layouts that look like an unrelated template.

The owner will provide the original logo. Ask for any missing official
brand assets rather than inventing them.

## 12.2 Design principles

-   Mobile-first responsive design.
-   Clear hierarchy and readable Arabic typography.
-   Large, obvious service actions.
-   Short and understandable forms.
-   Visible progress and confirmation feedback.
-   Accessible contrast and focus states.
-   Consistent buttons, cards, icons, spacing, and form styles.
-   Avoid intrusive pop-ups.
-   Do not use fake reviews, fake counters, fake partner logos, or
    invented trust badges.

## 12.3 Suggested homepage message

English concept:

**Your Journey Starts Here.**\
Travel, visa assistance, and reservation requests --- made easier with
Easy Visa.

Arabic concept:

**رحلتك تبدأ من هنا.**\
خدمات التأشيرات والسفر والحجوزات بطريقة سهلة وواضحة.

The owner should approve final wording before publication.

------------------------------------------------------------------------

# 13. Contact and Business Information

Known information available for initial configuration:

  Item                     Information
  ------------------------ ----------------------------
  Brand                    Easy Visa
  Arabic brand name        إيزي فيزا
  Business location        Mukalla, Hadhramaut, Yemen
  Primary contact number   +967780007578
  Instagram display name   Easy Visa
  Brand phrase             راحة . أمان
  Marketing phrase         رحلتك تبدأ من هنا

Important implementation notes:

-   Confirm whether the primary phone number is also the WhatsApp number
    before publishing the WhatsApp link.
-   Obtain the exact Instagram profile URL from the owner. "Easy Visa"
    is a display name, not necessarily a unique username or URL.
-   Obtain the Facebook page URL if Facebook is to be linked.
-   Do not invent a street address, email address, office hours, legal
    registration number, or other contact detail.
-   All contact details must be editable from the admin dashboard.

------------------------------------------------------------------------

# 14. Pricing, Currency, and Offers

## 14.1 Price display

The website should support:

-   Optional price.
-   Price range.
-   "Request a quotation" / "Contact us" label.
-   Currency selection per service or offer.
-   Clear terms and validity dates.

Potential currencies include:

-   Saudi Riyal (SAR).
-   Yemeni Rial (YER).
-   US Dollar (USD).

The owner must control which currencies are displayed. Do not
automatically convert prices unless a reliable exchange-rate source and
an explicit business rule are implemented.

## 14.2 Price accuracy

-   Prices must be editable by authorized staff.
-   A price may be marked as indicative or subject to confirmation.
-   Offers must include validity dates and conditions when applicable.
-   Do not promise availability or a final price before the office
    confirms it.

## 14.3 Offer management

Offer lifecycle:

1.  Draft.
2.  Scheduled.
3.  Active.
4.  Expired.
5.  Archived.

The system should hide expired offers from active promotional areas
automatically, while retaining them in the admin area.

------------------------------------------------------------------------

# 15. Security, Privacy, and Data Protection

The website may receive sensitive identity and travel documents.
Security must be treated as a core requirement.

## 15.1 Minimum security requirements

-   HTTPS across the entire website.
-   Secure password hashing.
-   Multi-factor authentication for administrators if supported and
    practical.
-   Role-based permissions.
-   Rate limiting on login, tracking, and public forms.
-   CSRF protection where applicable.
-   Server-side validation for all submitted fields.
-   Protection against SQL injection and cross-site scripting.
-   Secure session handling and logout.
-   Regular software and dependency updates.
-   Database backups with a documented restore process.
-   Audit logs for sensitive admin actions.
-   No secrets or API keys in client-side code or public repositories.

## 15.2 Document upload security

Passport scans and other identity documents require special care:

-   Accept only explicitly permitted file types.
-   Validate actual file type, not only filename extension.
-   Enforce reasonable file-size limits.
-   Store files outside the public web root or in private object
    storage.
-   Use authorization checks for every file access.
-   Use temporary, expiring download links if applicable.
-   Do not expose documents through guessable public URLs.
-   Scan uploaded files for malware where the hosting environment
    supports it.
-   Do not send passport documents to WhatsApp automatically.
-   Restrict document access to authorized staff.
-   Define a retention and deletion policy with the owner.

## 15.3 Privacy policy

The website must include a privacy policy explaining:

-   What information is collected.
-   Why it is collected.
-   How documents are handled.
-   Who can access the information.
-   Whether data is shared with service providers or agents to process a
    request.
-   How long information is retained.
-   How a customer can contact the business about their data.

The owner should review and approve the policy and any applicable legal
obligations before launch.

## 15.4 Customer consent

Before submission, include a clear consent statement acknowledging that
the information is being provided so Easy Visa can review and respond to
the service request. Link to the privacy policy.

------------------------------------------------------------------------

# 16. Technical Architecture Recommendations

The developer may propose an appropriate technology stack, but should
explain why it suits this project and its long-term maintenance.

## 16.1 Architecture goals

-   Maintainable and well-documented code.
-   Secure server-side request handling.
-   Relational data model for requests, customers, services, users, and
    status history.
-   Localization support.
-   Private file storage.
-   Admin dashboard separated by authentication and permissions.
-   Clear separation between public website and administrative
    functions.
-   Backup and recovery plan.
-   Easy future integration with messaging, payment, airline, hotel, or
    partner systems.

## 16.2 Technology selection

The developer should recommend the stack and specify:

-   Frontend framework.
-   Backend framework / runtime.
-   Database.
-   Admin dashboard approach.
-   File storage method.
-   Hosting provider and deployment approach.
-   Backup method.
-   Error monitoring and logging.
-   Maintenance and upgrade approach.

Do not select a technology solely because it is fashionable. Consider
developer competence, cost, security, maintainability, and ease of
handover.

## 16.3 Suggested data entities

A practical initial database may include:

-   `users` --- admin and staff accounts.
-   `roles` / `permissions` --- access control.
-   `customers` --- minimal customer identity and contact details.
-   `services` --- service definitions.
-   `service_translations` --- Arabic and English content.
-   `service_form_fields` --- configurable form definitions, if
    implemented.
-   `requests` --- customer service requests.
-   `request_field_values` --- submitted form values, if using dynamic
    forms.
-   `request_documents` --- private uploaded document metadata and
    storage references.
-   `request_status_history` --- status changes.
-   `request_internal_notes` --- staff-only notes.
-   `request_messages` --- customer-visible updates, if implemented.
-   `offers` --- promotions.
-   `offer_translations` --- offer language content.
-   `site_settings` --- phone, social links, and configurable settings.
-   `admin_audit_logs` --- important administrative actions.

The developer may refine the schema, but it must preserve data
integrity, privacy, and traceability.

## 16.4 Request data model considerations

Each request should have:

-   Internal database ID.
-   Public reference number.
-   Service ID / service type.
-   Customer name and contact details.
-   Submitted form data.
-   Request source: website, WhatsApp/manual, phone, or in person.
-   Current status.
-   Submission timestamp.
-   Last updated timestamp.
-   Assigned staff member, if applicable.
-   Customer-visible message, if applicable.
-   Internal notes stored separately.
-   Document references stored securely.

Avoid storing unnecessary personal data. Define which fields are
sensitive and restrict access accordingly.

------------------------------------------------------------------------

# 17. Search Engine Optimization and Performance

## 17.1 SEO

-   Semantic HTML.
-   Unique page titles and meta descriptions.
-   Descriptive URLs.
-   Sitemap XML.
-   Robots.txt.
-   Correct canonical tags.
-   Arabic and English metadata.
-   `hreflang` implementation.
-   Open Graph metadata for social sharing.
-   Optimized image alt text.
-   Structured data only where accurate and appropriate.
-   No fabricated ratings or business claims.

## 17.2 Performance

-   Optimize and compress images.
-   Use modern image formats where supported.
-   Lazy-load below-the-fold images.
-   Minimize unnecessary scripts.
-   Use caching appropriately.
-   Avoid oversized hero media.
-   Ensure forms remain responsive on slower connections.
-   Test performance on typical mobile devices and networks.

## 17.3 Accessibility

Aim for WCAG 2.2 AA practices where feasible:

-   Keyboard-accessible navigation.
-   Visible focus indicators.
-   Proper form labels.
-   Useful error messages.
-   Sufficient color contrast.
-   Meaningful image alternative text.
-   Screen-reader-friendly status and confirmation messages.

------------------------------------------------------------------------

# 18. Analytics and Operational Reporting

Recommended for the first release, if it can be implemented without
unnecessary complexity:

-   Count website requests by service.
-   Count requests by status.
-   Track request submission dates.
-   Track the source of a request (website or manually entered).
-   Record basic page analytics using a privacy-conscious analytics
    tool, subject to owner approval.

Do not collect excessive visitor data or introduce intrusive tracking.
Do not treat page views as confirmed customers or bookings.

------------------------------------------------------------------------

# 19. Explicitly Out of Scope for Release 1

To keep the first version focused and affordable, the following are
**not required** in the initial release:

-   Native Android or iOS applications.
-   Online payment gateway.
-   Automated visa issuance or direct government portal integration.
-   Automatic visa approval checks.
-   Airline reservation or ticket issuance engine.
-   Live airline inventory integration.
-   Live hotel inventory / booking engine.
-   Accounting, invoicing, or bookkeeping system.
-   Inventory management.
-   Complex CRM and marketing automation.
-   Automated WhatsApp Business API messaging.
-   Automated SMS reminders.
-   Full supplier / agent commission management.
-   Customer wallet or loyalty points.

The architecture should not prevent future additions, but these items
must not be silently included in the first-release estimate.

------------------------------------------------------------------------

# 20. Future Development Roadmap

Potential phases after the initial website is stable:

## Phase 2 --- Customer communication

-   WhatsApp Business API integration.
-   Email and SMS notifications.
-   Customer notification preferences.
-   More advanced request communication history.

## Phase 3 --- Operational improvements

-   Staff assignment and workload view.
-   More detailed request reports.
-   Configurable forms and document checklists.
-   Customer account / login, if justified.
-   Downloadable request receipts.

## Phase 4 --- Commercial integrations

-   Online payment options suitable for the business and its market.
-   Airline and hotel supplier integrations where contracts and APIs are
    available.
-   Supplier / agent workflows.
-   Automated quotations where reliable data sources exist.

## Phase 5 --- Advanced platform

-   Customer portal.
-   Additional languages.
-   Mobile application, if demand justifies it.
-   More advanced analytics.
-   Automated reminders for travel and visa-related dates, subject to
    customer consent and reliable date data.

Future phases require separate scope, pricing, and approval.

------------------------------------------------------------------------

# 21. Testing and Quality Assurance

The developer must test at least the following before handover.

## 21.1 Public website tests

-   Homepage loads on mobile, tablet, and desktop.
-   Arabic pages display correctly in RTL.
-   English pages display correctly in LTR.
-   Language switching works.
-   All navigation links work.
-   Service pages display the correct content.
-   Offers display correctly and expired offers are not shown as active.
-   Phone and WhatsApp links open the correct destination.
-   Social links point to the approved profiles.

## 21.2 Form tests

-   Every service form submits successfully.
-   Required-field validation works.
-   Optional fields remain optional.
-   Conditional fields work correctly.
-   Invalid file types are rejected.
-   File size limits work.
-   Duplicate submission protection works.
-   Successful submission creates a unique reference number.
-   The request is stored and appears in the dashboard.
-   Confirmation page is understandable in both languages.

## 21.3 Admin tests

-   Unauthorized users cannot access the dashboard.
-   Staff permissions work as agreed.
-   Admin can search and filter requests.
-   Admin can update statuses.
-   Status history is recorded.
-   Internal notes are not visible to customers.
-   Admin can manage services and offers.
-   Admin can update contact information.
-   Document access is restricted.
-   Backup and restore procedures are tested.

## 21.4 Tracking tests

-   Correct reference and verification details show the correct request.
-   Incorrect details do not reveal request information.
-   Customer-facing status is translated.
-   Internal notes and private files are never exposed.
-   Tracking works on mobile.

------------------------------------------------------------------------

# 22. Acceptance Criteria and Handover

The project should not be considered complete until the owner has tested
and accepted the agreed scope.

## 22.1 Functional acceptance checklist

-   [ ] Professional homepage and navigation.
-   [ ] Service categories and individual service pages.
-   [ ] Arabic and English content and layouts.
-   [ ] Responsive mobile, tablet, and desktop layouts.
-   [ ] Separate request forms for all agreed service categories.
-   [ ] Secure document upload where enabled.
-   [ ] Website requests stored in the database.
-   [ ] Unique request reference number.
-   [ ] WhatsApp contact actions.
-   [ ] Admin dashboard.
-   [ ] Request search and filters.
-   [ ] Status management and status history.
-   [ ] Customer request tracking with verification.
-   [ ] Service and offer management.
-   [ ] Editable contact and social details.
-   [ ] Privacy policy and customer consent.
-   [ ] Basic SEO and performance optimization.
-   [ ] Security checks and tested backup process.

## 22.2 Handover deliverables

The developer must provide:

1.  Complete source code.
2.  Database schema and a database export.
3.  Production deployment and hosting details.
4.  Domain registration / ownership details.
5.  Administrator credentials transferred securely.
6.  Documentation for deployment and maintenance.
7.  Instructions for adding services and offers.
8.  Instructions for managing requests and updating statuses.
9.  Backup and restore instructions.
10. List of third-party services, subscriptions, and recurring costs.
11. List of any paid themes, libraries, plugins, or licenses.
12. A defined bug-fix / warranty period after launch.

The domain, hosting account, source code, database, and business data
must be under the control of Easy Visa or its authorized owner. Do not
make the business dependent on a developer-owned personal account.

------------------------------------------------------------------------

# 23. Developer Proposal and Quotation Requirements

Before development begins, ask the developer to submit a written
proposal containing:

  Item                        Developer response required
  --------------------------- ---------------------------------------
  Proposed technology stack   Frameworks, language, database
  Design approach             Custom design or adapted theme
  Page list                   All included pages
  Functional scope            Forms, dashboard, tracking, offers
  Bilingual support           Arabic RTL and English LTR
  Security approach           Authentication, file storage, backups
  Hosting                     Provider and annual cost
  Domain                      Registration and renewal cost
  Development cost            Itemized one-time cost
  Recurring costs             Hosting, email, plugins, licenses
  Timeline                    Milestones and estimated dates
  Testing                     Included QA and acceptance process
  Maintenance                 Support scope and price
  Ownership                   Source code, domain, database, assets
  Warranty                    Duration and what is covered

Ask for separate pricing for: - Required Release 1 features. - Optional
enhancements. - Future integrations.

This makes it easier to compare proposals fairly and avoid unexpected
costs.

------------------------------------------------------------------------

# 24. Suggested Development Milestones

A milestone-based approach is recommended:

1.  **Discovery and confirmation**
    -   Confirm page structure, forms, content, brand assets, and
        technical proposal.
2.  **UI/UX design**
    -   Homepage, service pages, forms, tracking page, and admin
        dashboard mockups.
    -   Owner approval before full implementation.
3.  **Public website development**
    -   Responsive pages, bilingual content, service catalog, offers,
        and contact actions.
4.  **Backend and database**
    -   Request processing, document storage, reference numbers, and
        notifications.
5.  **Administration dashboard**
    -   Request management, statuses, content, services, offers, and
        permissions.
6.  **Customer tracking**
    -   Secure request lookup and customer-visible status information.
7.  **Testing and security review**
    -   Functional, responsive, bilingual, privacy, and security
        testing.
8.  **Deployment and handover**
    -   Production launch, training, documentation, source-code
        transfer, and backup verification.

The developer should provide a realistic timeline after reviewing the
requirements. Do not assume a fixed delivery date before the scope and
resources are confirmed.

------------------------------------------------------------------------

# 25. Important Business Rules

The following rules should guide design and development:

1.  Easy Visa receives and manages customer requests; the website does
    not itself guarantee visa approval, ticket issuance, hotel
    availability, or reservation confirmation.
2.  A submitted request is an inquiry / service request, not a confirmed
    booking.
3.  Prices and availability must be confirmed by Easy Visa before being
    treated as final.
4.  Visa requirements and procedures can change. All published
    requirements must be editable and verified by the business before
    publication.
5.  Do not invent government approvals, licenses, partnerships,
    testimonials, ratings, or success statistics.
6.  Collect only information necessary to process the selected request.
7.  Protect passport and identity documents as confidential information.
8.  Keep internal notes separate from customer-visible information.
9.  Every website request must be traceable through a unique reference
    number.
10. The owner must be able to manage routine content and operational
    updates without asking a developer.

------------------------------------------------------------------------

# 26. Open Items to Confirm With the Owner Before Launch

These are content and operational details that should be confirmed. They
should not block the developer from preparing the design and
architecture.

-   [ ] Original Easy Visa logo file (preferably SVG or transparent
    PNG).
-   [ ] Final brand color values, if already defined.
-   [ ] Confirm whether +967780007578 is also the WhatsApp number.
-   [ ] Exact Instagram profile URL.
-   [ ] Facebook page URL, if applicable.
-   [ ] Business email address, if one will be published.
-   [ ] Public office address and opening hours, if the owner wants them
    shown.
-   [ ] Approved Arabic and English About Us text.
-   [ ] Final service descriptions and current requirements.
-   [ ] Which services should display prices.
-   [ ] Approved prices, currencies, and offer terms.
-   [ ] Privacy policy and data-retention rules.
-   [ ] Admin and staff accounts.
-   [ ] Preferred hosting / domain arrangement.
-   [ ] Whether email notifications are required at launch.

The developer should use clearly marked placeholders for missing
information, not fabricated details.

------------------------------------------------------------------------

# 27. Final Instruction to the Developer

Build Easy Visa as a polished, bilingual, mobile-first travel-services
request platform with a secure administration dashboard.

The most important Release 1 capabilities are:

1.  Professional Arabic and English website.
2.  Clear visa and travel service pages.
3.  Service-specific customer request forms.
4.  Secure document uploads when required.
5.  Website and WhatsApp request channels.
6.  Centralized admin request management.
7.  Unique request reference numbers.
8.  Secure customer request tracking.
9.  Editable services, offers, prices, and contact details.
10. Secure, maintainable architecture and full owner handover.

Keep the first release focused. Do not add payment processing, automated
visa issuance, airline / hotel booking engines, accounting, or complex
CRM features unless separately approved in writing.

Before coding the complete system, present: - Sitemap. - Homepage and
service-page wireframes. - Sample request form. - Admin dashboard
wireframe. - Proposed database / architecture overview. - Itemized
quotation and delivery milestones.

Obtain owner approval of these items before proceeding to full
development.

**The desired outcome:** A trustworthy and easy-to-use Easy Visa website
that helps customers understand services, submit requests, communicate
with the office, and follow request progress --- while giving the owner
a practical system to manage day-to-day requests and grow the business
over time.

------------------------------------------------------------------------

**End of document --- Easy Visa Website Product Requirements, Version
1.0**
