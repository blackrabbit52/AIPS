INSERT INTO roles (name, description) 
VALUES 
    ('ROLE_USER', 'Default user role'),
    ('ROLE_ADMIN', 'Administrator role'),
    ('ROLE_SUPER_ADMIN', 'Super administrator role'),
    ('ROLE_ANALYST', 'Analyst role')
ON CONFLICT (name) DO NOTHING; 