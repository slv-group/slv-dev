-- ============================================================
-- 1. Correct spelling of Amaravathi -> Amaravti across projects
-- 2. Update locations for Laila Towers & Laila Green Meadows
-- ============================================================

-- 1. Update project names, descriptions, locations from Amaravathi to Amaravti
UPDATE projects
SET 
  name = replace(replace(name, 'Amaravathi', 'Amaravti'), 'AMARAVATHI', 'AMARAVTI'),
  description = replace(replace(description, 'Amaravathi', 'Amaravti'), 'AMARAVATHI', 'AMARAVTI'),
  location = replace(replace(location, 'Amaravathi', 'Amaravti'), 'AMARAVATHI', 'AMARAVTI')
WHERE name ILIKE '%amaravathi%'
   OR description ILIKE '%amaravathi%'
   OR location ILIKE '%amaravathi%';

-- 2. Update specifications and nearby JSON arrays where Amaravathi is present
UPDATE projects
SET specifications = (
  SELECT jsonb_agg(
    jsonb_set(
      jsonb_set(spec, '{label}', to_jsonb(replace(spec->>'label', 'Amaravathi', 'Amaravti'))),
      '{value}', to_jsonb(replace(spec->>'value', 'Amaravathi', 'Amaravti'))
    )
  )
  FROM jsonb_array_elements(specifications) AS spec
)
WHERE specifications::text ILIKE '%amaravathi%';

UPDATE projects
SET nearby = (
  SELECT jsonb_agg(
    jsonb_set(near, '{label}', to_jsonb(replace(near->>'label', 'Amaravathi', 'Amaravti')))
  )
  FROM jsonb_array_elements(nearby) AS near
)
WHERE nearby::text ILIKE '%amaravathi%';

-- 3. Update locations for Laila Towers and Laila Green Meadows
UPDATE projects
SET location = 'Kesarapalli, Gannavaram, Vijayawada'
WHERE slug IN ('slv-laila-towers', 'slv-laila-green-meadows')
   OR name ILIKE '%laila towers%'
   OR name ILIKE '%laila green meadows%';
