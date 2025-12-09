-- Script to ensure unique names for Categories and Locations per user
-- Run this in Supabase SQL Editor

-- 1. Add Unique Constraint to Categories
-- Note: If you have duplicates, this might fail. You should run cleanup_data.sql first or manually dedupe.
ALTER TABLE public.categories 
ADD CONSTRAINT unique_category_name_per_user UNIQUE (user_id, name);

-- 2. Add Unique Constraint to Locations
ALTER TABLE public.locations 
ADD CONSTRAINT unique_location_name_per_user UNIQUE (user_id, name);
