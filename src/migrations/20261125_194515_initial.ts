import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum_requests_contact_log_channel" AS ENUM('whatsapp', 'call', 'in_person', 'email');
  CREATE TYPE "public"."enum_requests_contact_log_outcome" AS ENUM('reached', 'no_answer', 'left_message');
  CREATE TYPE "public"."enum_requests_status_history_from" AS ENUM('new', 'under_review', 'awaiting_customer', 'in_progress', 'completed', 'rejected', 'cancelled');
  CREATE TYPE "public"."enum_requests_status_history_to" AS ENUM('new', 'under_review', 'awaiting_customer', 'in_progress', 'completed', 'rejected', 'cancelled');
  CREATE TYPE "public"."enum_requests_invoice_currency" AS ENUM('SAR', 'YER', 'USD');
  CREATE TYPE "public"."enum_requests_payment_status" AS ENUM('none', 'unpaid', 'pending_review', 'partial', 'paid');
  CREATE TYPE "public"."enum_requests_status" AS ENUM('new', 'under_review', 'awaiting_customer', 'in_progress', 'completed', 'rejected', 'cancelled');
  CREATE TYPE "public"."enum_requests_source" AS ENUM('website', 'whatsapp', 'phone', 'walk_in');
  CREATE TYPE "public"."enum_requests_customer_locale" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum_payments_currency" AS ENUM('SAR', 'YER', 'USD');
  CREATE TYPE "public"."enum_payments_method" AS ENUM('bank_transfer', 'card', 'remittance', 'cash');
  CREATE TYPE "public"."enum_payments_status" AS ENUM('pending_review', 'paid', 'rejected', 'refunded');
  CREATE TYPE "public"."enum_payments_source" AS ENUM('customer', 'staff');
  CREATE TYPE "public"."enum_contact_messages_subject" AS ENUM('general', 'visa', 'booking', 'trip', 'payment', 'complaint', 'other');
  CREATE TYPE "public"."enum_contact_messages_status" AS ENUM('new', 'replied', 'closed');
  CREATE TYPE "public"."enum_contact_messages_locale" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum_customers_preferred_locale" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum_trips_type" AS ENUM('bus', 'flight', 'umrah', 'package');
  CREATE TYPE "public"."enum_trips_price_mode" AS ENUM('hidden', 'quote', 'fixed', 'from', 'range');
  CREATE TYPE "public"."enum_trips_price_currency" AS ENUM('SAR', 'YER', 'USD');
  CREATE TYPE "public"."enum_trips_status" AS ENUM('draft', 'published', 'archived');
  CREATE TYPE "public"."enum_companies_type" AS ENUM('airline', 'bus', 'hotel', 'agent', 'other');
  CREATE TYPE "public"."enum_services_form_fields_type" AS ENUM('text', 'textarea', 'number', 'date', 'select', 'radio', 'destination', 'tel', 'email', 'checkbox');
  CREATE TYPE "public"."enum_services_form_fields_width" AS ENUM('full', 'half');
  CREATE TYPE "public"."enum_services_icon" AS ENUM('kaaba', 'family', 'passport', 'globe', 'plane', 'bus', 'hotel', 'chat');
  CREATE TYPE "public"."enum_services_price_mode" AS ENUM('hidden', 'quote', 'fixed', 'from', 'range');
  CREATE TYPE "public"."enum_services_price_currency" AS ENUM('SAR', 'YER', 'USD');
  CREATE TYPE "public"."enum_services_status" AS ENUM('draft', 'published', 'archived');
  CREATE TYPE "public"."enum_offers_price_mode" AS ENUM('hidden', 'quote', 'fixed', 'from', 'range');
  CREATE TYPE "public"."enum_offers_price_currency" AS ENUM('SAR', 'YER', 'USD');
  CREATE TYPE "public"."enum_offers_status" AS ENUM('draft', 'published', 'archived');
  CREATE TYPE "public"."enum_faqs_topic" AS ENUM('general', 'requests', 'documents', 'prices');
  CREATE TYPE "public"."enum_faqs_status" AS ENUM('draft', 'published', 'archived');
  CREATE TYPE "public"."enum_users_role" AS ENUM('owner', 'staff');
  CREATE TYPE "public"."enum_site_settings_bank_accounts_currency" AS ENUM('SAR', 'YER', 'USD');
  CREATE TYPE "public"."enum_homepage_pillars_icon" AS ENUM('passport', 'chat', 'ticket', 'checklist');
  CREATE TABLE "requests_answers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"key" varchar
  );
  
  CREATE TABLE "requests_internal_notes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"note" varchar NOT NULL,
  	"by_id" integer,
  	"at" timestamp(3) with time zone
  );
  
  CREATE TABLE "requests_contact_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"channel" "enum_requests_contact_log_channel" DEFAULT 'whatsapp' NOT NULL,
  	"outcome" "enum_requests_contact_log_outcome" DEFAULT 'reached' NOT NULL,
  	"note" varchar,
  	"by_id" integer,
  	"at" timestamp(3) with time zone
  );
  
  CREATE TABLE "requests_status_history" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"from" "enum_requests_status_history_from",
  	"to" "enum_requests_status_history_to",
  	"at" timestamp(3) with time zone,
  	"by_id" integer,
  	"customer_message" varchar
  );
  
  CREATE TABLE "requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"contact_name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"whatsapp" varchar,
  	"service_id" integer,
  	"trip_id" integer,
  	"seats" numeric,
  	"customer_notes" varchar,
  	"data" jsonb,
  	"customer_message" varchar,
  	"invoice_amount" numeric,
  	"invoice_currency" "enum_requests_invoice_currency" DEFAULT 'SAR',
  	"invoice_due_date" timestamp(3) with time zone,
  	"invoice_description" varchar,
  	"invoice_allow_bank_transfer" boolean DEFAULT true,
  	"invoice_allow_cash" boolean DEFAULT true,
  	"invoice_card_payment_url" varchar,
  	"paid_amount" numeric DEFAULT 0,
  	"payment_status" "enum_requests_payment_status" DEFAULT 'none',
  	"reference" varchar,
  	"status" "enum_requests_status" DEFAULT 'new' NOT NULL,
  	"assigned_to_id" integer,
  	"source" "enum_requests_source" DEFAULT 'website' NOT NULL,
  	"customer_id" integer,
  	"travel_date" timestamp(3) with time zone,
  	"customer_locale" "enum_requests_customer_locale" DEFAULT 'ar',
  	"last_status_at" timestamp(3) with time zone,
  	"idempotency_key" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"request_id" integer NOT NULL,
  	"amount" numeric NOT NULL,
  	"currency" "enum_payments_currency" DEFAULT 'SAR' NOT NULL,
  	"method" "enum_payments_method" DEFAULT 'bank_transfer' NOT NULL,
  	"status" "enum_payments_status" DEFAULT 'pending_review' NOT NULL,
  	"payer_name" varchar,
  	"transfer_reference" varchar,
  	"to_account" varchar,
  	"receipt_id" integer,
  	"note" varchar,
  	"customer_note" varchar,
  	"reference" varchar,
  	"source" "enum_payments_source" DEFAULT 'staff',
  	"paid_at" timestamp(3) with time zone,
  	"reviewed_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "contact_messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"email" varchar,
  	"subject" "enum_contact_messages_subject" DEFAULT 'general',
  	"message" varchar NOT NULL,
  	"reply" varchar,
  	"page_url" varchar,
  	"status" "enum_contact_messages_status" DEFAULT 'new',
  	"handled_by_id" integer,
  	"locale" "enum_contact_messages_locale" DEFAULT 'ar',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "customers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"full_name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"whatsapp" varchar,
  	"preferred_locale" "enum_customers_preferred_locale" DEFAULT 'ar',
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "request_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"request_id" integer,
  	"slot" varchar,
  	"slot_label" varchar,
  	"original_name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "trips_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "trips_features_locales" (
  	"item" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "trips" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_trips_type" DEFAULT 'bus' NOT NULL,
  	"company_id" integer,
  	"service_id" integer,
  	"departure_at" timestamp(3) with time zone NOT NULL,
  	"return_at" timestamp(3) with time zone,
  	"image_id" integer,
  	"price_mode" "enum_trips_price_mode" DEFAULT 'quote',
  	"price_amount" numeric,
  	"price_amount_max" numeric,
  	"price_currency" "enum_trips_price_currency" DEFAULT 'SAR',
  	"price_indicative" boolean DEFAULT true,
  	"child_price" numeric,
  	"seats_total" numeric,
  	"seats_booked" numeric DEFAULT 0,
  	"seats_held_offline" numeric DEFAULT 0,
  	"max_seats_per_booking" numeric DEFAULT 10,
  	"show_seats_left" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"status" "enum_trips_status" DEFAULT 'draft' NOT NULL,
  	"booking_open" boolean DEFAULT true,
  	"manual_full" boolean,
  	"featured" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "trips_locales" (
  	"title" varchar NOT NULL,
  	"from" varchar NOT NULL,
  	"to" varchar NOT NULL,
  	"duration" varchar,
  	"meeting_point" varchar,
  	"details" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "companies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_companies_type" DEFAULT 'bus' NOT NULL,
  	"logo_id" integer,
  	"phone" varchar,
  	"website" varchar,
  	"internal_notes" varchar,
  	"active" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "companies_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "page_views" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"path" varchar NOT NULL,
  	"locale" varchar,
  	"day" varchar NOT NULL,
  	"visitor" varchar,
  	"device" varchar,
  	"referrer" varchar,
  	"country" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "services_requirements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "services_requirements_locales" (
  	"item" varchar NOT NULL,
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "services_faqs_locales" (
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services_form_fields_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "services_form_fields_options_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services_form_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"type" "enum_services_form_fields_type" DEFAULT 'text' NOT NULL,
  	"width" "enum_services_form_fields_width" DEFAULT 'full',
  	"required" boolean,
  	"min" numeric,
  	"max" numeric,
  	"future_only" boolean DEFAULT true,
  	"show_hijri" boolean,
  	"after_field" varchar,
  	"show_when_field" varchar,
  	"show_when_equals" varchar
  );
  
  CREATE TABLE "services_form_fields_locales" (
  	"label" varchar NOT NULL,
  	"placeholder" varchar,
  	"help" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services_document_slots" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"required" boolean
  );
  
  CREATE TABLE "services_document_slots_locales" (
  	"label" varchar NOT NULL,
  	"help" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum_services_icon" DEFAULT 'passport',
  	"image_id" integer,
  	"price_mode" "enum_services_price_mode" DEFAULT 'quote',
  	"price_amount" numeric,
  	"price_amount_max" numeric,
  	"price_currency" "enum_services_price_currency" DEFAULT 'SAR',
  	"price_indicative" boolean DEFAULT true,
  	"available" boolean DEFAULT true,
  	"whatsapp_number" varchar,
  	"category_id" integer NOT NULL,
  	"slug" varchar NOT NULL,
  	"status" "enum_services_status" DEFAULT 'draft' NOT NULL,
  	"featured" boolean,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "services_locales" (
  	"title" varchar NOT NULL,
  	"summary" varchar NOT NULL,
  	"body" jsonb,
  	"audience" varchar,
  	"notes" varchar,
  	"unavailable_note" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "services_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer
  );
  
  CREATE TABLE "service_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "service_categories_locales" (
  	"title" varchar NOT NULL,
  	"intro" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "destinations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"active" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "destinations_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "offers_includes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "offers_includes_locales" (
  	"item" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "offers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"price_mode" "enum_offers_price_mode" DEFAULT 'quote',
  	"price_amount" numeric,
  	"price_amount_max" numeric,
  	"price_currency" "enum_offers_price_currency" DEFAULT 'SAR',
  	"price_indicative" boolean DEFAULT true,
  	"service_id" integer,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone,
  	"slug" varchar NOT NULL,
  	"status" "enum_offers_status" DEFAULT 'draft' NOT NULL,
  	"featured" boolean,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "offers_locales" (
  	"title" varchar NOT NULL,
  	"summary" varchar NOT NULL,
  	"body" jsonb,
  	"terms" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "faqs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"topic" "enum_faqs_topic" DEFAULT 'general',
  	"status" "enum_faqs_status" DEFAULT 'draft' NOT NULL,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "faqs_locales" (
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'staff' NOT NULL,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "audit_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"action" varchar NOT NULL,
  	"collection_slug" varchar,
  	"document_id" varchar,
  	"summary" varchar,
  	"user_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"requests_id" integer,
  	"payments_id" integer,
  	"contact_messages_id" integer,
  	"customers_id" integer,
  	"request_documents_id" integer,
  	"trips_id" integer,
  	"companies_id" integer,
  	"page_views_id" integer,
  	"services_id" integer,
  	"service_categories_id" integer,
  	"destinations_id" integer,
  	"offers_id" integer,
  	"faqs_id" integer,
  	"media_id" integer,
  	"users_id" integer,
  	"audit_logs_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"phone" varchar NOT NULL,
  	"whatsapp" boolean DEFAULT true,
  	"calls" boolean DEFAULT true
  );
  
  CREATE TABLE "site_settings_contacts_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_bank_accounts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"account_name" varchar NOT NULL,
  	"account_number" varchar NOT NULL,
  	"iban" varchar,
  	"currency" "enum_site_settings_bank_accounts_currency",
  	"active" boolean DEFAULT true
  );
  
  CREATE TABLE "site_settings_bank_accounts_locales" (
  	"bank_name" varchar NOT NULL,
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_notify_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"primary_whatsapp" varchar NOT NULL,
  	"email" varchar,
  	"map_url" varchar,
  	"instagram" varchar,
  	"facebook" varchar,
  	"tiktok" varchar,
  	"snapchat" varchar,
  	"announcement_enabled" boolean,
  	"announcement_link" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"city" varchar,
  	"address" varchar,
  	"hours" varchar,
  	"payment_instructions" varchar,
  	"whatsapp_templates_after_submit" varchar,
  	"whatsapp_templates_status_update" varchar,
  	"site_name" varchar NOT NULL,
  	"tagline" varchar,
  	"footer_about" varchar,
  	"consent_text" varchar,
  	"announcement_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "homepage_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_homepage_pillars_icon" DEFAULT 'passport'
  );
  
  CREATE TABLE "homepage_pillars_locales" (
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "homepage_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "homepage_steps_locales" (
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "homepage_promises" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "homepage_promises_locales" (
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "homepage_locales" (
  	"hero_title" varchar NOT NULL,
  	"hero_subtitle" varchar,
  	"about_teaser" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "about_page_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "about_page_sections_locales" (
  	"heading" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "about_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "about_page_locales" (
  	"title" varchar NOT NULL,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "legal_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_on" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "legal_pages_locales" (
  	"privacy" jsonb,
  	"terms" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "requests_answers" ADD CONSTRAINT "requests_answers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "requests_internal_notes" ADD CONSTRAINT "requests_internal_notes_by_id_users_id_fk" FOREIGN KEY ("by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "requests_internal_notes" ADD CONSTRAINT "requests_internal_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "requests_contact_log" ADD CONSTRAINT "requests_contact_log_by_id_users_id_fk" FOREIGN KEY ("by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "requests_contact_log" ADD CONSTRAINT "requests_contact_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "requests_status_history" ADD CONSTRAINT "requests_status_history_by_id_users_id_fk" FOREIGN KEY ("by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "requests_status_history" ADD CONSTRAINT "requests_status_history_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "requests" ADD CONSTRAINT "requests_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "requests" ADD CONSTRAINT "requests_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "requests" ADD CONSTRAINT "requests_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "requests" ADD CONSTRAINT "requests_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_request_id_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_receipt_id_request_documents_id_fk" FOREIGN KEY ("receipt_id") REFERENCES "public"."request_documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_handled_by_id_users_id_fk" FOREIGN KEY ("handled_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "request_documents" ADD CONSTRAINT "request_documents_request_id_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trips_features" ADD CONSTRAINT "trips_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trips_features_locales" ADD CONSTRAINT "trips_features_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."trips_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trips" ADD CONSTRAINT "trips_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trips" ADD CONSTRAINT "trips_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trips" ADD CONSTRAINT "trips_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trips_locales" ADD CONSTRAINT "trips_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "companies" ADD CONSTRAINT "companies_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "companies_locales" ADD CONSTRAINT "companies_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_requirements" ADD CONSTRAINT "services_requirements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_requirements_locales" ADD CONSTRAINT "services_requirements_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_requirements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_faqs" ADD CONSTRAINT "services_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_faqs_locales" ADD CONSTRAINT "services_faqs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_form_fields_options" ADD CONSTRAINT "services_form_fields_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_form_fields"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_form_fields_options_locales" ADD CONSTRAINT "services_form_fields_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_form_fields_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_form_fields" ADD CONSTRAINT "services_form_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_form_fields_locales" ADD CONSTRAINT "services_form_fields_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_form_fields"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_document_slots" ADD CONSTRAINT "services_document_slots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_document_slots_locales" ADD CONSTRAINT "services_document_slots_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_document_slots"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_category_id_service_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."service_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_locales" ADD CONSTRAINT "services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "service_categories_locales" ADD CONSTRAINT "service_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."service_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "destinations_locales" ADD CONSTRAINT "destinations_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "offers_includes" ADD CONSTRAINT "offers_includes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "offers_includes_locales" ADD CONSTRAINT "offers_includes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."offers_includes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "offers" ADD CONSTRAINT "offers_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offers" ADD CONSTRAINT "offers_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offers_locales" ADD CONSTRAINT "offers_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faqs_locales" ADD CONSTRAINT "faqs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_requests_fk" FOREIGN KEY ("requests_id") REFERENCES "public"."requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payments_fk" FOREIGN KEY ("payments_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_messages_fk" FOREIGN KEY ("contact_messages_id") REFERENCES "public"."contact_messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_customers_fk" FOREIGN KEY ("customers_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_request_documents_fk" FOREIGN KEY ("request_documents_id") REFERENCES "public"."request_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_trips_fk" FOREIGN KEY ("trips_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_companies_fk" FOREIGN KEY ("companies_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_page_views_fk" FOREIGN KEY ("page_views_id") REFERENCES "public"."page_views"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_service_categories_fk" FOREIGN KEY ("service_categories_id") REFERENCES "public"."service_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_destinations_fk" FOREIGN KEY ("destinations_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_offers_fk" FOREIGN KEY ("offers_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_logs_fk" FOREIGN KEY ("audit_logs_id") REFERENCES "public"."audit_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_contacts" ADD CONSTRAINT "site_settings_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_contacts_locales" ADD CONSTRAINT "site_settings_contacts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_bank_accounts" ADD CONSTRAINT "site_settings_bank_accounts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_bank_accounts_locales" ADD CONSTRAINT "site_settings_bank_accounts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_bank_accounts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_notify_emails" ADD CONSTRAINT "site_settings_notify_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_pillars" ADD CONSTRAINT "homepage_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_pillars_locales" ADD CONSTRAINT "homepage_pillars_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_pillars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_steps" ADD CONSTRAINT "homepage_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_steps_locales" ADD CONSTRAINT "homepage_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_promises" ADD CONSTRAINT "homepage_promises_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_promises_locales" ADD CONSTRAINT "homepage_promises_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_promises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_locales" ADD CONSTRAINT "homepage_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_sections" ADD CONSTRAINT "about_page_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_sections_locales" ADD CONSTRAINT "about_page_sections_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_locales" ADD CONSTRAINT "about_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "legal_pages_locales" ADD CONSTRAINT "legal_pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."legal_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "requests_answers_order_idx" ON "requests_answers" USING btree ("_order");
  CREATE INDEX "requests_answers_parent_id_idx" ON "requests_answers" USING btree ("_parent_id");
  CREATE INDEX "requests_internal_notes_order_idx" ON "requests_internal_notes" USING btree ("_order");
  CREATE INDEX "requests_internal_notes_parent_id_idx" ON "requests_internal_notes" USING btree ("_parent_id");
  CREATE INDEX "requests_internal_notes_by_idx" ON "requests_internal_notes" USING btree ("by_id");
  CREATE INDEX "requests_contact_log_order_idx" ON "requests_contact_log" USING btree ("_order");
  CREATE INDEX "requests_contact_log_parent_id_idx" ON "requests_contact_log" USING btree ("_parent_id");
  CREATE INDEX "requests_contact_log_by_idx" ON "requests_contact_log" USING btree ("by_id");
  CREATE INDEX "requests_status_history_order_idx" ON "requests_status_history" USING btree ("_order");
  CREATE INDEX "requests_status_history_parent_id_idx" ON "requests_status_history" USING btree ("_parent_id");
  CREATE INDEX "requests_status_history_by_idx" ON "requests_status_history" USING btree ("by_id");
  CREATE INDEX "requests_phone_idx" ON "requests" USING btree ("phone");
  CREATE INDEX "requests_service_idx" ON "requests" USING btree ("service_id");
  CREATE INDEX "requests_trip_idx" ON "requests" USING btree ("trip_id");
  CREATE INDEX "requests_payment_status_idx" ON "requests" USING btree ("payment_status");
  CREATE UNIQUE INDEX "requests_reference_idx" ON "requests" USING btree ("reference");
  CREATE INDEX "requests_status_idx" ON "requests" USING btree ("status");
  CREATE INDEX "requests_assigned_to_idx" ON "requests" USING btree ("assigned_to_id");
  CREATE INDEX "requests_source_idx" ON "requests" USING btree ("source");
  CREATE INDEX "requests_customer_idx" ON "requests" USING btree ("customer_id");
  CREATE INDEX "requests_travel_date_idx" ON "requests" USING btree ("travel_date");
  CREATE UNIQUE INDEX "requests_idempotency_key_idx" ON "requests" USING btree ("idempotency_key");
  CREATE INDEX "requests_updated_at_idx" ON "requests" USING btree ("updated_at");
  CREATE INDEX "requests_created_at_idx" ON "requests" USING btree ("created_at");
  CREATE INDEX "payments_request_idx" ON "payments" USING btree ("request_id");
  CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");
  CREATE INDEX "payments_receipt_idx" ON "payments" USING btree ("receipt_id");
  CREATE UNIQUE INDEX "payments_reference_idx" ON "payments" USING btree ("reference");
  CREATE INDEX "payments_reviewed_by_idx" ON "payments" USING btree ("reviewed_by_id");
  CREATE INDEX "payments_updated_at_idx" ON "payments" USING btree ("updated_at");
  CREATE INDEX "payments_created_at_idx" ON "payments" USING btree ("created_at");
  CREATE INDEX "contact_messages_status_idx" ON "contact_messages" USING btree ("status");
  CREATE INDEX "contact_messages_handled_by_idx" ON "contact_messages" USING btree ("handled_by_id");
  CREATE INDEX "contact_messages_updated_at_idx" ON "contact_messages" USING btree ("updated_at");
  CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages" USING btree ("created_at");
  CREATE UNIQUE INDEX "customers_phone_idx" ON "customers" USING btree ("phone");
  CREATE INDEX "customers_updated_at_idx" ON "customers" USING btree ("updated_at");
  CREATE INDEX "customers_created_at_idx" ON "customers" USING btree ("created_at");
  CREATE INDEX "request_documents_request_idx" ON "request_documents" USING btree ("request_id");
  CREATE INDEX "request_documents_updated_at_idx" ON "request_documents" USING btree ("updated_at");
  CREATE INDEX "request_documents_created_at_idx" ON "request_documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "request_documents_filename_idx" ON "request_documents" USING btree ("filename");
  CREATE INDEX "trips_features_order_idx" ON "trips_features" USING btree ("_order");
  CREATE INDEX "trips_features_parent_id_idx" ON "trips_features" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "trips_features_locales_locale_parent_id_unique" ON "trips_features_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "trips_features_locales_parent_id_idx" ON "trips_features_locales" USING btree ("_parent_id");
  CREATE INDEX "trips_company_idx" ON "trips" USING btree ("company_id");
  CREATE INDEX "trips_service_idx" ON "trips" USING btree ("service_id");
  CREATE INDEX "trips_departure_at_idx" ON "trips" USING btree ("departure_at");
  CREATE INDEX "trips_image_idx" ON "trips" USING btree ("image_id");
  CREATE UNIQUE INDEX "trips_slug_idx" ON "trips" USING btree ("slug");
  CREATE INDEX "trips_status_idx" ON "trips" USING btree ("status");
  CREATE INDEX "trips_updated_at_idx" ON "trips" USING btree ("updated_at");
  CREATE INDEX "trips_created_at_idx" ON "trips" USING btree ("created_at");
  CREATE UNIQUE INDEX "trips_locales_locale_parent_id_unique" ON "trips_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "trips_locales_parent_id_idx" ON "trips_locales" USING btree ("_parent_id");
  CREATE INDEX "companies_logo_idx" ON "companies" USING btree ("logo_id");
  CREATE INDEX "companies_updated_at_idx" ON "companies" USING btree ("updated_at");
  CREATE INDEX "companies_created_at_idx" ON "companies" USING btree ("created_at");
  CREATE UNIQUE INDEX "companies_locales_locale_parent_id_unique" ON "companies_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "companies_locales_parent_id_idx" ON "companies_locales" USING btree ("_parent_id");
  CREATE INDEX "page_views_path_idx" ON "page_views" USING btree ("path");
  CREATE INDEX "page_views_day_idx" ON "page_views" USING btree ("day");
  CREATE INDEX "page_views_visitor_idx" ON "page_views" USING btree ("visitor");
  CREATE INDEX "page_views_device_idx" ON "page_views" USING btree ("device");
  CREATE INDEX "page_views_referrer_idx" ON "page_views" USING btree ("referrer");
  CREATE INDEX "page_views_updated_at_idx" ON "page_views" USING btree ("updated_at");
  CREATE INDEX "page_views_created_at_idx" ON "page_views" USING btree ("created_at");
  CREATE INDEX "services_requirements_order_idx" ON "services_requirements" USING btree ("_order");
  CREATE INDEX "services_requirements_parent_id_idx" ON "services_requirements" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "services_requirements_locales_locale_parent_id_unique" ON "services_requirements_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_requirements_locales_parent_id_idx" ON "services_requirements_locales" USING btree ("_parent_id");
  CREATE INDEX "services_faqs_order_idx" ON "services_faqs" USING btree ("_order");
  CREATE INDEX "services_faqs_parent_id_idx" ON "services_faqs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "services_faqs_locales_locale_parent_id_unique" ON "services_faqs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_faqs_locales_parent_id_idx" ON "services_faqs_locales" USING btree ("_parent_id");
  CREATE INDEX "services_form_fields_options_order_idx" ON "services_form_fields_options" USING btree ("_order");
  CREATE INDEX "services_form_fields_options_parent_id_idx" ON "services_form_fields_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "services_form_fields_options_locales_locale_parent_id_unique" ON "services_form_fields_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_form_fields_options_locales_parent_id_idx" ON "services_form_fields_options_locales" USING btree ("_parent_id");
  CREATE INDEX "services_form_fields_order_idx" ON "services_form_fields" USING btree ("_order");
  CREATE INDEX "services_form_fields_parent_id_idx" ON "services_form_fields" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "services_form_fields_locales_locale_parent_id_unique" ON "services_form_fields_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_form_fields_locales_parent_id_idx" ON "services_form_fields_locales" USING btree ("_parent_id");
  CREATE INDEX "services_document_slots_order_idx" ON "services_document_slots" USING btree ("_order");
  CREATE INDEX "services_document_slots_parent_id_idx" ON "services_document_slots" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "services_document_slots_locales_locale_parent_id_unique" ON "services_document_slots_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_document_slots_locales_parent_id_idx" ON "services_document_slots_locales" USING btree ("_parent_id");
  CREATE INDEX "services_image_idx" ON "services" USING btree ("image_id");
  CREATE INDEX "services_category_idx" ON "services" USING btree ("category_id");
  CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE INDEX "services_status_idx" ON "services" USING btree ("status");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE UNIQUE INDEX "services_locales_locale_parent_id_unique" ON "services_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_locales_parent_id_idx" ON "services_locales" USING btree ("_parent_id");
  CREATE INDEX "services_rels_order_idx" ON "services_rels" USING btree ("order");
  CREATE INDEX "services_rels_parent_idx" ON "services_rels" USING btree ("parent_id");
  CREATE INDEX "services_rels_path_idx" ON "services_rels" USING btree ("path");
  CREATE INDEX "services_rels_services_id_idx" ON "services_rels" USING btree ("services_id");
  CREATE UNIQUE INDEX "service_categories_slug_idx" ON "service_categories" USING btree ("slug");
  CREATE INDEX "service_categories_updated_at_idx" ON "service_categories" USING btree ("updated_at");
  CREATE INDEX "service_categories_created_at_idx" ON "service_categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "service_categories_locales_locale_parent_id_unique" ON "service_categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "service_categories_locales_parent_id_idx" ON "service_categories_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "destinations_code_idx" ON "destinations" USING btree ("code");
  CREATE INDEX "destinations_updated_at_idx" ON "destinations" USING btree ("updated_at");
  CREATE INDEX "destinations_created_at_idx" ON "destinations" USING btree ("created_at");
  CREATE UNIQUE INDEX "destinations_locales_locale_parent_id_unique" ON "destinations_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "destinations_locales_parent_id_idx" ON "destinations_locales" USING btree ("_parent_id");
  CREATE INDEX "offers_includes_order_idx" ON "offers_includes" USING btree ("_order");
  CREATE INDEX "offers_includes_parent_id_idx" ON "offers_includes" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "offers_includes_locales_locale_parent_id_unique" ON "offers_includes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "offers_includes_locales_parent_id_idx" ON "offers_includes_locales" USING btree ("_parent_id");
  CREATE INDEX "offers_image_idx" ON "offers" USING btree ("image_id");
  CREATE INDEX "offers_service_idx" ON "offers" USING btree ("service_id");
  CREATE UNIQUE INDEX "offers_slug_idx" ON "offers" USING btree ("slug");
  CREATE INDEX "offers_status_idx" ON "offers" USING btree ("status");
  CREATE INDEX "offers_updated_at_idx" ON "offers" USING btree ("updated_at");
  CREATE INDEX "offers_created_at_idx" ON "offers" USING btree ("created_at");
  CREATE UNIQUE INDEX "offers_locales_locale_parent_id_unique" ON "offers_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "offers_locales_parent_id_idx" ON "offers_locales" USING btree ("_parent_id");
  CREATE INDEX "faqs_status_idx" ON "faqs" USING btree ("status");
  CREATE INDEX "faqs_updated_at_idx" ON "faqs" USING btree ("updated_at");
  CREATE INDEX "faqs_created_at_idx" ON "faqs" USING btree ("created_at");
  CREATE UNIQUE INDEX "faqs_locales_locale_parent_id_unique" ON "faqs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "faqs_locales_parent_id_idx" ON "faqs_locales" USING btree ("_parent_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_locales_parent_id_idx" ON "media_locales" USING btree ("_parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");
  CREATE INDEX "audit_logs_collection_slug_idx" ON "audit_logs" USING btree ("collection_slug");
  CREATE INDEX "audit_logs_document_id_idx" ON "audit_logs" USING btree ("document_id");
  CREATE INDEX "audit_logs_user_idx" ON "audit_logs" USING btree ("user_id");
  CREATE INDEX "audit_logs_updated_at_idx" ON "audit_logs" USING btree ("updated_at");
  CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("requests_id");
  CREATE INDEX "payload_locked_documents_rels_payments_id_idx" ON "payload_locked_documents_rels" USING btree ("payments_id");
  CREATE INDEX "payload_locked_documents_rels_contact_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_messages_id");
  CREATE INDEX "payload_locked_documents_rels_customers_id_idx" ON "payload_locked_documents_rels" USING btree ("customers_id");
  CREATE INDEX "payload_locked_documents_rels_request_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("request_documents_id");
  CREATE INDEX "payload_locked_documents_rels_trips_id_idx" ON "payload_locked_documents_rels" USING btree ("trips_id");
  CREATE INDEX "payload_locked_documents_rels_companies_id_idx" ON "payload_locked_documents_rels" USING btree ("companies_id");
  CREATE INDEX "payload_locked_documents_rels_page_views_id_idx" ON "payload_locked_documents_rels" USING btree ("page_views_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_service_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("service_categories_id");
  CREATE INDEX "payload_locked_documents_rels_destinations_id_idx" ON "payload_locked_documents_rels" USING btree ("destinations_id");
  CREATE INDEX "payload_locked_documents_rels_offers_id_idx" ON "payload_locked_documents_rels" USING btree ("offers_id");
  CREATE INDEX "payload_locked_documents_rels_faqs_id_idx" ON "payload_locked_documents_rels" USING btree ("faqs_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_audit_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_logs_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_contacts_order_idx" ON "site_settings_contacts" USING btree ("_order");
  CREATE INDEX "site_settings_contacts_parent_id_idx" ON "site_settings_contacts" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_settings_contacts_locales_locale_parent_id_unique" ON "site_settings_contacts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_contacts_locales_parent_id_idx" ON "site_settings_contacts_locales" USING btree ("_parent_id");
  CREATE INDEX "site_settings_bank_accounts_order_idx" ON "site_settings_bank_accounts" USING btree ("_order");
  CREATE INDEX "site_settings_bank_accounts_parent_id_idx" ON "site_settings_bank_accounts" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_settings_bank_accounts_locales_locale_parent_id_unique" ON "site_settings_bank_accounts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_bank_accounts_locales_parent_id_idx" ON "site_settings_bank_accounts_locales" USING btree ("_parent_id");
  CREATE INDEX "site_settings_notify_emails_order_idx" ON "site_settings_notify_emails" USING btree ("_order");
  CREATE INDEX "site_settings_notify_emails_parent_id_idx" ON "site_settings_notify_emails" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_locales_parent_id_idx" ON "site_settings_locales" USING btree ("_parent_id");
  CREATE INDEX "homepage_pillars_order_idx" ON "homepage_pillars" USING btree ("_order");
  CREATE INDEX "homepage_pillars_parent_id_idx" ON "homepage_pillars" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "homepage_pillars_locales_locale_parent_id_unique" ON "homepage_pillars_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_pillars_locales_parent_id_idx" ON "homepage_pillars_locales" USING btree ("_parent_id");
  CREATE INDEX "homepage_steps_order_idx" ON "homepage_steps" USING btree ("_order");
  CREATE INDEX "homepage_steps_parent_id_idx" ON "homepage_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "homepage_steps_locales_locale_parent_id_unique" ON "homepage_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_steps_locales_parent_id_idx" ON "homepage_steps_locales" USING btree ("_parent_id");
  CREATE INDEX "homepage_promises_order_idx" ON "homepage_promises" USING btree ("_order");
  CREATE INDEX "homepage_promises_parent_id_idx" ON "homepage_promises" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "homepage_promises_locales_locale_parent_id_unique" ON "homepage_promises_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_promises_locales_parent_id_idx" ON "homepage_promises_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "homepage_locales_locale_parent_id_unique" ON "homepage_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_locales_parent_id_idx" ON "homepage_locales" USING btree ("_parent_id");
  CREATE INDEX "about_page_sections_order_idx" ON "about_page_sections" USING btree ("_order");
  CREATE INDEX "about_page_sections_parent_id_idx" ON "about_page_sections" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "about_page_sections_locales_locale_parent_id_unique" ON "about_page_sections_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_page_sections_locales_parent_id_idx" ON "about_page_sections_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "about_page_locales_locale_parent_id_unique" ON "about_page_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_page_locales_parent_id_idx" ON "about_page_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "legal_pages_locales_locale_parent_id_unique" ON "legal_pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "legal_pages_locales_parent_id_idx" ON "legal_pages_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "requests_answers" CASCADE;
  DROP TABLE "requests_internal_notes" CASCADE;
  DROP TABLE "requests_contact_log" CASCADE;
  DROP TABLE "requests_status_history" CASCADE;
  DROP TABLE "requests" CASCADE;
  DROP TABLE "payments" CASCADE;
  DROP TABLE "contact_messages" CASCADE;
  DROP TABLE "customers" CASCADE;
  DROP TABLE "request_documents" CASCADE;
  DROP TABLE "trips_features" CASCADE;
  DROP TABLE "trips_features_locales" CASCADE;
  DROP TABLE "trips" CASCADE;
  DROP TABLE "trips_locales" CASCADE;
  DROP TABLE "companies" CASCADE;
  DROP TABLE "companies_locales" CASCADE;
  DROP TABLE "page_views" CASCADE;
  DROP TABLE "services_requirements" CASCADE;
  DROP TABLE "services_requirements_locales" CASCADE;
  DROP TABLE "services_faqs" CASCADE;
  DROP TABLE "services_faqs_locales" CASCADE;
  DROP TABLE "services_form_fields_options" CASCADE;
  DROP TABLE "services_form_fields_options_locales" CASCADE;
  DROP TABLE "services_form_fields" CASCADE;
  DROP TABLE "services_form_fields_locales" CASCADE;
  DROP TABLE "services_document_slots" CASCADE;
  DROP TABLE "services_document_slots_locales" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "services_locales" CASCADE;
  DROP TABLE "services_rels" CASCADE;
  DROP TABLE "service_categories" CASCADE;
  DROP TABLE "service_categories_locales" CASCADE;
  DROP TABLE "destinations" CASCADE;
  DROP TABLE "destinations_locales" CASCADE;
  DROP TABLE "offers_includes" CASCADE;
  DROP TABLE "offers_includes_locales" CASCADE;
  DROP TABLE "offers" CASCADE;
  DROP TABLE "offers_locales" CASCADE;
  DROP TABLE "faqs" CASCADE;
  DROP TABLE "faqs_locales" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "audit_logs" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_contacts" CASCADE;
  DROP TABLE "site_settings_contacts_locales" CASCADE;
  DROP TABLE "site_settings_bank_accounts" CASCADE;
  DROP TABLE "site_settings_bank_accounts_locales" CASCADE;
  DROP TABLE "site_settings_notify_emails" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "homepage_pillars" CASCADE;
  DROP TABLE "homepage_pillars_locales" CASCADE;
  DROP TABLE "homepage_steps" CASCADE;
  DROP TABLE "homepage_steps_locales" CASCADE;
  DROP TABLE "homepage_promises" CASCADE;
  DROP TABLE "homepage_promises_locales" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "homepage_locales" CASCADE;
  DROP TABLE "about_page_sections" CASCADE;
  DROP TABLE "about_page_sections_locales" CASCADE;
  DROP TABLE "about_page" CASCADE;
  DROP TABLE "about_page_locales" CASCADE;
  DROP TABLE "legal_pages" CASCADE;
  DROP TABLE "legal_pages_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_requests_contact_log_channel";
  DROP TYPE "public"."enum_requests_contact_log_outcome";
  DROP TYPE "public"."enum_requests_status_history_from";
  DROP TYPE "public"."enum_requests_status_history_to";
  DROP TYPE "public"."enum_requests_invoice_currency";
  DROP TYPE "public"."enum_requests_payment_status";
  DROP TYPE "public"."enum_requests_status";
  DROP TYPE "public"."enum_requests_source";
  DROP TYPE "public"."enum_requests_customer_locale";
  DROP TYPE "public"."enum_payments_currency";
  DROP TYPE "public"."enum_payments_method";
  DROP TYPE "public"."enum_payments_status";
  DROP TYPE "public"."enum_payments_source";
  DROP TYPE "public"."enum_contact_messages_subject";
  DROP TYPE "public"."enum_contact_messages_status";
  DROP TYPE "public"."enum_contact_messages_locale";
  DROP TYPE "public"."enum_customers_preferred_locale";
  DROP TYPE "public"."enum_trips_type";
  DROP TYPE "public"."enum_trips_price_mode";
  DROP TYPE "public"."enum_trips_price_currency";
  DROP TYPE "public"."enum_trips_status";
  DROP TYPE "public"."enum_companies_type";
  DROP TYPE "public"."enum_services_form_fields_type";
  DROP TYPE "public"."enum_services_form_fields_width";
  DROP TYPE "public"."enum_services_icon";
  DROP TYPE "public"."enum_services_price_mode";
  DROP TYPE "public"."enum_services_price_currency";
  DROP TYPE "public"."enum_services_status";
  DROP TYPE "public"."enum_offers_price_mode";
  DROP TYPE "public"."enum_offers_price_currency";
  DROP TYPE "public"."enum_offers_status";
  DROP TYPE "public"."enum_faqs_topic";
  DROP TYPE "public"."enum_faqs_status";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_site_settings_bank_accounts_currency";
  DROP TYPE "public"."enum_homepage_pillars_icon";`)
}
