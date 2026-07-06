DO $$
BEGIN
    -- Add the column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='projects' AND column_name='lead_id'
    ) THEN
        ALTER TABLE public.projects 
        ADD COLUMN lead_id UUID;
    END IF;

    -- Add the constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name='projects' AND constraint_name='fk_projects_lead'
    ) THEN
        ALTER TABLE public.projects
        ADD CONSTRAINT fk_projects_lead
        FOREIGN KEY (lead_id)
        REFERENCES public.crm_leads(id)
        ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_projects_lead_id ON public.projects(lead_id);
