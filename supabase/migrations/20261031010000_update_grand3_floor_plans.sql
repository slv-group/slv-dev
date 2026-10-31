-- Update Block B floor plan area for SLV Amaravathi Grand-3 from 0 to '2325 – 3250'
-- Preserves existing genuine uploaded floor plan image and other block records intact.

UPDATE projects
SET floor_plans = (
  SELECT jsonb_agg(
    CASE 
      WHEN fp->>'type' ILIKE '%Block B%' THEN jsonb_set(fp, '{sqft}', '"2325 – 3250"')
      ELSE fp
    END
  )
  FROM jsonb_array_elements(floor_plans) AS fp
)
WHERE slug = 'slv-amaravathi-grand-3'
   OR name ILIKE '%amaravathi grand-3%'
   OR name ILIKE '%amaravathi grand iii%';
