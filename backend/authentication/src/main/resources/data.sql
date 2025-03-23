DROP TABLE IF EXISTS roles CASCADE;

INSERT INTO roles (name, description) 
VALUES ('ROLE_USER', 'Standard user role') 
ON CONFLICT (name) DO NOTHING;

INSERT INTO roles (name, description) 
VALUES ('ROLE_ADMIN', 'Administrator role') 
ON CONFLICT (name) DO NOTHING;

INSERT INTO roles (name, description) 
VALUES ('ROLE_SUPER_ADMIN', 'Super administrator role') 
ON CONFLICT (name) DO NOTHING;

INSERT INTO roles (name, description) 
VALUES ('ROLE_ANALYST', 'Analyst role') 
ON CONFLICT (name) DO NOTHING;

-- Ajouter un log pour vérifier l'exécution
DO $$
BEGIN
    RAISE NOTICE 'Roles initialization completed';
END $$;