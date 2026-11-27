import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_trips_travel_class" AS ENUM('normal', 'vip', 'other');
  ALTER TABLE "trips" ADD COLUMN "travel_class" "enum_trips_travel_class" DEFAULT 'normal';
  ALTER TABLE "trips" ADD COLUMN "from_country_id" integer;
  ALTER TABLE "trips" ADD COLUMN "to_country_id" integer;
  ALTER TABLE "trips" ADD CONSTRAINT "trips_from_country_id_destinations_id_fk" FOREIGN KEY ("from_country_id") REFERENCES "public"."destinations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trips" ADD CONSTRAINT "trips_to_country_id_destinations_id_fk" FOREIGN KEY ("to_country_id") REFERENCES "public"."destinations"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "trips_from_country_idx" ON "trips" USING btree ("from_country_id");
  CREATE INDEX "trips_to_country_idx" ON "trips" USING btree ("to_country_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "trips" DROP CONSTRAINT "trips_from_country_id_destinations_id_fk";
  
  ALTER TABLE "trips" DROP CONSTRAINT "trips_to_country_id_destinations_id_fk";
  
  DROP INDEX "trips_from_country_idx";
  DROP INDEX "trips_to_country_idx";
  ALTER TABLE "trips" DROP COLUMN "travel_class";
  ALTER TABLE "trips" DROP COLUMN "from_country_id";
  ALTER TABLE "trips" DROP COLUMN "to_country_id";
  DROP TYPE "public"."enum_trips_travel_class";`)
}
