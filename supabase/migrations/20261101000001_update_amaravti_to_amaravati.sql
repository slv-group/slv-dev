-- ============================================================
-- Update spelling of Amaravti & Amaravathi -> Amaravati across projects
-- ============================================================

-- 1. Update project names, descriptions, locations to Amaravati
UPDATE projects
SET 
  name = replace(replace(replace(replace(name, 'Amaravti', 'Amaravati'), 'AMARAVTI', 'AMARAVATI'), 'Amaravathi', 'Amaravati'), 'AMARAVATHI', 'AMARAVATI'),
  description = replace(replace(replace(replace(description, 'Amaravti', 'Amaravati'), 'AMARAVTI', 'AMARAVATI'), 'Amaravathi', 'Amaravati'), 'AMARAVATHI', 'AMARAVATI'),
  location = replace(replace(replace(replace(location, 'Amaravti', 'Amaravati'), 'AMARAVTI', 'AMARAVATI'), 'Amaravathi', 'Amaravati'), 'AMARAVATHI', 'AMARAVATI')
WHERE name ILIKE '%amaravti%'
   OR name ILIKE '%amaravathi%'
   OR description ILIKE '%amaravti%'
   OR description ILIKE '%amaravathi%'
   OR location ILIKE '%amaravti%'
   OR location ILIKE '%amaravathi%';

-- 2. Update specifications and nearby JSON arrays
UPDATE projects
SET specifications = (
  SELECT jsonb_agg(
    jsonb_set(
      jsonb_set(spec, '{label}', to_jsonb(replace(replace(spec->>'label', 'Amaravti', 'Amaravati'), 'Amaravathi', 'Amaravati'))),
      '{value}', to_jsonb(replace(replace(spec->>'value', 'Amaravti', 'Amaravati'), 'Amaravathi', 'Amaravati'))
    )
  )
  FROM jsonb_array_elements(specifications) AS spec
)
WHERE specifications::text ILIKE '%amaravti%' OR specifications::text ILIKE '%amaravathi%';

UPDATE projects
SET nearby = (
  SELECT jsonb_agg(
    jsonb_set(near, '{label}', to_jsonb(replace(replace(near->>'label', 'Amaravti', 'Amaravati'), 'Amaravathi', 'Amaravati')))
  )
  FROM jsonb_array_elements(nearby) AS near
)
WHERE nearby::text ILIKE '%amaravti%' OR nearby::text ILIKE '%amaravathi%';
