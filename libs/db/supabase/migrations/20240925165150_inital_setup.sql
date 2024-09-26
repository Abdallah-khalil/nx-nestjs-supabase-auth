create type "public"."pricing_plan_interval" as enum ('day', 'week', 'month', 'year');

create type "public"."pricing_type" as enum ('one_time', 'recurring');

create type "public"."subscription_status" as enum ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused');

create table "public"."stripe_products" (
    "id" text not null,
    "active" boolean,
    "name" text,
    "description" text,
    "image" text,
    "metadata" jsonb
);


alter table "public"."stripe_products" enable row level security;

create table "public"."stripe_products_prices" (
    "id" text not null,
    "product_id" text,
    "active" boolean,
    "description" text,
    "unit_amount" double precision,
    "currency" text,
    "type" pricing_type,
    "interval" pricing_plan_interval,
    "interval_count" bigint,
    "trial_period_days" bigint,
    "metadata" jsonb
);


alter table "public"."stripe_products_prices" enable row level security;

create table "public"."users" (
    "id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "full_name" text,
    "profile_picture" text,
    "address" jsonb,
    "stripe_customer_id" text not null
);


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX stripe_products_pkey ON public.stripe_products USING btree (id);

CREATE UNIQUE INDEX stripe_products_prices_pkey ON public.stripe_products_prices USING btree (id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

CREATE UNIQUE INDEX users_stripe_customer_id_key ON public.users USING btree (stripe_customer_id);

alter table "public"."stripe_products" add constraint "stripe_products_pkey" PRIMARY KEY using index "stripe_products_pkey";

alter table "public"."stripe_products_prices" add constraint "stripe_products_prices_pkey" PRIMARY KEY using index "stripe_products_prices_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."users" add constraint "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) not valid;

alter table "public"."users" validate constraint "users_id_fkey";

alter table "public"."users" add constraint "users_stripe_customer_id_key" UNIQUE using index "users_stripe_customer_id_key";

grant delete on table "public"."stripe_products" to "anon";

grant insert on table "public"."stripe_products" to "anon";

grant references on table "public"."stripe_products" to "anon";

grant select on table "public"."stripe_products" to "anon";

grant trigger on table "public"."stripe_products" to "anon";

grant truncate on table "public"."stripe_products" to "anon";

grant update on table "public"."stripe_products" to "anon";

grant delete on table "public"."stripe_products" to "authenticated";

grant insert on table "public"."stripe_products" to "authenticated";

grant references on table "public"."stripe_products" to "authenticated";

grant select on table "public"."stripe_products" to "authenticated";

grant trigger on table "public"."stripe_products" to "authenticated";

grant truncate on table "public"."stripe_products" to "authenticated";

grant update on table "public"."stripe_products" to "authenticated";

grant delete on table "public"."stripe_products" to "service_role";

grant insert on table "public"."stripe_products" to "service_role";

grant references on table "public"."stripe_products" to "service_role";

grant select on table "public"."stripe_products" to "service_role";

grant trigger on table "public"."stripe_products" to "service_role";

grant truncate on table "public"."stripe_products" to "service_role";

grant update on table "public"."stripe_products" to "service_role";

grant delete on table "public"."stripe_products_prices" to "anon";

grant insert on table "public"."stripe_products_prices" to "anon";

grant references on table "public"."stripe_products_prices" to "anon";

grant select on table "public"."stripe_products_prices" to "anon";

grant trigger on table "public"."stripe_products_prices" to "anon";

grant truncate on table "public"."stripe_products_prices" to "anon";

grant update on table "public"."stripe_products_prices" to "anon";

grant delete on table "public"."stripe_products_prices" to "authenticated";

grant insert on table "public"."stripe_products_prices" to "authenticated";

grant references on table "public"."stripe_products_prices" to "authenticated";

grant select on table "public"."stripe_products_prices" to "authenticated";

grant trigger on table "public"."stripe_products_prices" to "authenticated";

grant truncate on table "public"."stripe_products_prices" to "authenticated";

grant update on table "public"."stripe_products_prices" to "authenticated";

grant delete on table "public"."stripe_products_prices" to "service_role";

grant insert on table "public"."stripe_products_prices" to "service_role";

grant references on table "public"."stripe_products_prices" to "service_role";

grant select on table "public"."stripe_products_prices" to "service_role";

grant trigger on table "public"."stripe_products_prices" to "service_role";

grant truncate on table "public"."stripe_products_prices" to "service_role";

grant update on table "public"."stripe_products_prices" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";


