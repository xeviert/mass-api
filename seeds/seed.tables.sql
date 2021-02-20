BEGIN;

TRUNCATE
    'users';

INSERT INTO 'users' ('id', 'phone_number', 'password', 'role')
VALUES
    (
        1,
        '+17132575582',
        -- password = "pass"
        '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG',
        'admin'
    );

INSERT INTO 'items' ('id', 'product')
VALUES
    (1, 'snack kit'),
    (2, 'socks and underwear'),
    (3, 'walking shoes'),
    (4, 'pads/tampons'),
    (5, 'first aid kit'),
    (6, 'dental care kit'),
    (7, 'deodorant and soap'),        
    (8, 'earplugs'),
    (9, 'face mask, sanitizer, gloves'),
    (10, 'blanket'),
    (11, 'diapers, wipes, baby clothes'),
    (12, 'baby formula'),
    (13, 'school supplies'),
    (14, 'notepad, pens'),
    (15, 'hat, gloves, scarve'),
    (16, 'sweater/jacket');


COMMIT;