BEGIN;

TRUNCATE
    'user';

INSERT INTO 'user' ('id', 'phone_number', 'password')
VALUES
    (
        1,
        '7132575582',
        -- password = "pass"
        '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG'
    );

COMMIT;