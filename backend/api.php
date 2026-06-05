<?php
/**
 * api.php
 * -------
 * Drop-in PHP replacement for the FastAPI backend.
 * Handles all CRUD for design projects, IT projects, photos, image upload, and DB seeding.
 *
 * Endpoints:
 *   GET/POST        /api.php?r=design
 *   GET/PUT/DELETE  /api.php?r=design&id=xxx
 *   GET/POST        /api.php?r=it
 *   GET/PUT/DELETE  /api.php?r=it&id=xxx
 *   GET/POST        /api.php?r=photos
 *   GET/PUT/DELETE  /api.php?r=photos&id=xxx
 *   POST            /api.php?r=upload-image
 *   POST            /api.php?r=seed
 *   POST            /api.php?r=seed-reset
 */

// config

define('DB_HOST', 'localhost');
define('DB_USER', 'USER402238_porto');
define('DB_PASS', 'portodb123');
define('DB_NAME', 'db_402238_2');

define('UPLOAD_DIR', __DIR__ . '/uploads/');
define('UPLOAD_URL', '/uploads/');
define('ALLOWED_EXT', ['jpg','jpeg','png','gif','webp','avif']);

// bootstrap

header('Content-Type: application/json');

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// connection

$db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($db->connect_error) {
    respond(500, ['detail' => 'DB connection failed: ' . $db->connect_error]);
}
$db->set_charset('utf8mb4');

create_tables($db);

// router

$route  = isset($_GET['r'])  ? $_GET['r']  : '';
$id     = isset($_GET['id']) ? $_GET['id'] : null;
$method = $_SERVER['REQUEST_METHOD'];
$body   = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) $body = [];

if      ($route === 'design')       handle_design($db, $method, $id, $body);
else if ($route === 'it')           handle_it($db, $method, $id, $body);
else if ($route === 'photos')       handle_photos($db, $method, $id, $body);
else if ($route === 'upload-image') handle_upload();
else if ($route === 'seed')         handle_seed($db, false);
else if ($route === 'seed-reset')   handle_seed($db, true);
else                                respond(404, ['detail' => 'Not found']);

// schemes

function create_tables($db) {
    $tables = [
        "CREATE TABLE IF NOT EXISTS design_projects (
            id      VARCHAR(64) PRIMARY KEY,
            title   TEXT NOT NULL,
            `desc`  TEXT NOT NULL
        )",
        "CREATE TABLE IF NOT EXISTS design_tags (
            id          VARCHAR(64) PRIMARY KEY,
            project_id  VARCHAR(64) NOT NULL,
            `value`     TEXT NOT NULL
        )",
        "CREATE TABLE IF NOT EXISTS design_images (
            id          VARCHAR(64) PRIMARY KEY,
            project_id  VARCHAR(64) NOT NULL,
            url         TEXT NOT NULL
        )",
        "CREATE TABLE IF NOT EXISTS it_projects (
            id          VARCHAR(64) PRIMARY KEY,
            title       TEXT NOT NULL,
            image_src   TEXT,
            image_alt   TEXT
        )",
        "CREATE TABLE IF NOT EXISTS it_tags (
            id          VARCHAR(64) PRIMARY KEY,
            project_id  VARCHAR(64) NOT NULL,
            `value`     TEXT NOT NULL
        )",
        "CREATE TABLE IF NOT EXISTS it_descs (
            id          VARCHAR(64) PRIMARY KEY,
            project_id  VARCHAR(64) NOT NULL,
            position    INT NOT NULL DEFAULT 0,
            `text`      TEXT NOT NULL
        )",
        "CREATE TABLE IF NOT EXISTS photos (
            id      VARCHAR(64) PRIMARY KEY,
            src     TEXT NOT NULL,
            title   TEXT NOT NULL,
            `desc`  TEXT NOT NULL
        )",
    ];
    foreach ($tables as $sql) {
        if (!$db->query($sql)) {
            respond(500, ['detail' => 'Table creation failed: ' . $db->error]);
        }
    }
}

// utils

function respond($code, $data) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function uid($prefix = '') {
    return $prefix . substr(bin2hex(random_bytes(4)), 0, 6);
}

function db_fetch_all($db, $sql, $types = '', $params = []) {
    $stmt = $db->prepare($sql);
    if (!$stmt) respond(500, ['detail' => 'Prepare failed: ' . $db->error]);
    if ($types && $params) $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    $rows = [];
    while ($row = $result->fetch_assoc()) $rows[] = $row;
    $stmt->close();
    return $rows;
}

function db_fetch_one($db, $sql, $types, $params) {
    $stmt = $db->prepare($sql);
    if (!$stmt) respond(500, ['detail' => 'Prepare failed: ' . $db->error]);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $stmt->close();
    return $row ? $row : null;
}

function db_run($db, $sql, $types, $params) {
    $stmt = $db->prepare($sql);
    if (!$stmt) respond(500, ['detail' => 'Prepare failed: ' . $db->error]);
    $stmt->bind_param($types, ...$params);
    $ok = $stmt->execute();
    $stmt->close();
    return $ok;
}

// design

function fetch_design($db, $id) {
    $proj = db_fetch_one($db, "SELECT * FROM design_projects WHERE id = ?", 's', [$id]);
    if (!$proj) return null;
    $proj['tags']   = db_fetch_all($db, "SELECT id, `value` FROM design_tags   WHERE project_id = ?", 's', [$id]);
    $proj['images'] = db_fetch_all($db, "SELECT id, url     FROM design_images WHERE project_id = ?", 's', [$id]);
    return $proj;
}

function save_design_relations($db, $pid, $tags, $images) {
    foreach ($tags as $i => $v) {
        db_run($db, "INSERT INTO design_tags (id, project_id, `value`) VALUES (?,?,?)",
            'sss', ["{$pid}_t{$i}", $pid, $v]);
    }
    foreach ($images as $i => $url) {
        db_run($db, "INSERT INTO design_images (id, project_id, url) VALUES (?,?,?)",
            'sss', ["{$pid}_img{$i}", $pid, $url]);
    }
}

function handle_design($db, $method, $id, $body) {
    if ($method === 'GET' && !$id) {
        $rows = db_fetch_all($db, "SELECT id FROM design_projects");
        $out = [];
        foreach ($rows as $r) $out[] = fetch_design($db, $r['id']);
        respond(200, $out);
    }
    if ($method === 'GET' && $id) {
        $proj = fetch_design($db, $id);
        $proj ? respond(200, $proj) : respond(404, ['detail' => 'Design project not found']);
    }
    if ($method === 'POST') {
        $pid = isset($body['id']) ? $body['id'] : uid('d');
        db_run($db, "INSERT INTO design_projects (id, title, `desc`) VALUES (?,?,?)",
            'sss', [$pid, $body['title'] ?? '', $body['desc'] ?? '']);
        save_design_relations($db, $pid, $body['tags'] ?? [], $body['images'] ?? []);
        respond(201, fetch_design($db, $pid));
    }
    if ($method === 'PUT' && $id) {
        if (!fetch_design($db, $id)) respond(404, ['detail' => 'Design project not found']);
        db_run($db, "UPDATE design_projects SET title=?, `desc`=? WHERE id=?",
            'sss', [$body['title'] ?? '', $body['desc'] ?? '', $id]);
        db_run($db, "DELETE FROM design_tags   WHERE project_id=?", 's', [$id]);
        db_run($db, "DELETE FROM design_images WHERE project_id=?", 's', [$id]);
        save_design_relations($db, $id, $body['tags'] ?? [], $body['images'] ?? []);
        respond(200, fetch_design($db, $id));
    }
    if ($method === 'DELETE' && $id) {
        if (!fetch_design($db, $id)) respond(404, ['detail' => 'Design project not found']);
        db_run($db, "DELETE FROM design_projects WHERE id=?", 's', [$id]);
        respond(204, null);
    }
    respond(405, ['detail' => 'Method not allowed']);
}

// IT

function fetch_it($db, $id) {
    $proj = db_fetch_one($db, "SELECT * FROM it_projects WHERE id = ?", 's', [$id]);
    if (!$proj) return null;
    $proj['tags']  = db_fetch_all($db, "SELECT id, `value` FROM it_tags  WHERE project_id = ?", 's', [$id]);
    $proj['descs'] = db_fetch_all($db, "SELECT id, position, `text` FROM it_descs WHERE project_id = ? ORDER BY position", 's', [$id]);
    return $proj;
}

function save_it_relations($db, $pid, $tags, $desc) {
    foreach ($tags as $i => $v) {
        db_run($db, "INSERT INTO it_tags (id, project_id, `value`) VALUES (?,?,?)",
            'sss', ["{$pid}_t{$i}", $pid, $v]);
    }
    foreach ($desc as $i => $text) {
        if (trim($text) !== '') {
            db_run($db, "INSERT INTO it_descs (id, project_id, position, `text`) VALUES (?,?,?,?)",
                'ssis', ["{$pid}_d{$i}", $pid, $i, $text]);
        }
    }
}

function handle_it($db, $method, $id, $body) {
    if ($method === 'GET' && !$id) {
        $rows = db_fetch_all($db, "SELECT id FROM it_projects");
        $out = [];
        foreach ($rows as $r) $out[] = fetch_it($db, $r['id']);
        respond(200, $out);
    }
    if ($method === 'GET' && $id) {
        $proj = fetch_it($db, $id);
        $proj ? respond(200, $proj) : respond(404, ['detail' => 'IT project not found']);
    }
    if ($method === 'POST') {
        $pid = isset($body['id']) ? $body['id'] : uid('i');
        db_run($db, "INSERT INTO it_projects (id, title, image_src, image_alt) VALUES (?,?,?,?)",
            'ssss', [$pid, $body['title'] ?? '', $body['image_src'] ?? null, $body['image_alt'] ?? null]);
        save_it_relations($db, $pid, $body['tags'] ?? [], $body['desc'] ?? []);
        respond(201, fetch_it($db, $pid));
    }
    if ($method === 'PUT' && $id) {
        if (!fetch_it($db, $id)) respond(404, ['detail' => 'IT project not found']);
        db_run($db, "UPDATE it_projects SET title=?, image_src=?, image_alt=? WHERE id=?",
            'ssss', [$body['title'] ?? '', $body['image_src'] ?? null, $body['image_alt'] ?? null, $id]);
        db_run($db, "DELETE FROM it_tags  WHERE project_id=?", 's', [$id]);
        db_run($db, "DELETE FROM it_descs WHERE project_id=?", 's', [$id]);
        save_it_relations($db, $id, $body['tags'] ?? [], $body['desc'] ?? []);
        respond(200, fetch_it($db, $id));
    }
    if ($method === 'DELETE' && $id) {
        if (!fetch_it($db, $id)) respond(404, ['detail' => 'IT project not found']);
        db_run($db, "DELETE FROM it_projects WHERE id=?", 's', [$id]);
        respond(204, null);
    }
    respond(405, ['detail' => 'Method not allowed']);
}

// photos

function handle_photos($db, $method, $id, $body) {
    if ($method === 'GET' && !$id) {
        respond(200, db_fetch_all($db, "SELECT * FROM photos"));
    }
    if ($method === 'GET' && $id) {
        $row = db_fetch_one($db, "SELECT * FROM photos WHERE id = ?", 's', [$id]);
        $row ? respond(200, $row) : respond(404, ['detail' => 'Photo not found']);
    }
    if ($method === 'POST') {
        $pid = isset($body['id']) ? $body['id'] : uid('p');
        db_run($db, "INSERT INTO photos (id, src, title, `desc`) VALUES (?,?,?,?)",
            'ssss', [$pid, $body['src'] ?? '', $body['title'] ?? '', $body['desc'] ?? '']);
        respond(201, db_fetch_one($db, "SELECT * FROM photos WHERE id = ?", 's', [$pid]));
    }
    if ($method === 'PUT' && $id) {
        if (!db_fetch_one($db, "SELECT id FROM photos WHERE id = ?", 's', [$id]))
            respond(404, ['detail' => 'Photo not found']);
        db_run($db, "UPDATE photos SET src=?, title=?, `desc`=? WHERE id=?",
            'ssss', [$body['src'] ?? '', $body['title'] ?? '', $body['desc'] ?? '', $id]);
        respond(200, db_fetch_one($db, "SELECT * FROM photos WHERE id = ?", 's', [$id]));
    }
    if ($method === 'DELETE' && $id) {
        if (!db_fetch_one($db, "SELECT id FROM photos WHERE id = ?", 's', [$id]))
            respond(404, ['detail' => 'Photo not found']);
        db_run($db, "DELETE FROM photos WHERE id=?", 's', [$id]);
        respond(204, null);
    }
    respond(405, ['detail' => 'Method not allowed']);
}

// file upload

function handle_upload() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405, ['detail' => 'Method not allowed']);
    if (empty($_FILES['file'])) respond(400, ['detail' => 'No file provided']);

    $file = $_FILES['file'];
    $ext  = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if (!in_array($ext, ALLOWED_EXT)) respond(400, ['detail' => 'Unsupported image type']);

    if (!is_dir(UPLOAD_DIR)) mkdir(UPLOAD_DIR, 0755, true);

    $filename = bin2hex(random_bytes(16)) . '.' . $ext;
    $dest     = UPLOAD_DIR . $filename;

    if (!move_uploaded_file($file['tmp_name'], $dest)) respond(500, ['detail' => 'Upload failed']);

    respond(200, ['url' => UPLOAD_URL . $filename]);
}

// seeding

function handle_seed($db, $reset) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405, ['detail' => 'Method not allowed']);

    if ($reset) {
        foreach (['design_images','design_tags','design_projects','it_descs','it_tags','it_projects','photos'] as $t) {
            $db->query("DELETE FROM `$t`");
        }
    }

    $design_projects = [
        [
            'id'     => 'd0',
            'title'  => 'Project 1',
            'desc'   => 'Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere.',
            'tags'   => ['Illustrator', 'InDesign', 'Print'],
            'images' => ['https://picsum.photos/seed/d3a/1200/800'],
        ],
        [
            'id'     => 'd1',
            'title'  => 'Another Project',
            'desc'   => 'Ad litora torquent per conubia nostra inceptos himenaeos. Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis.',
            'tags'   => ['Figma', 'Prototyping', 'iOS'],
            'images' => ['https://picsum.photos/seed/d3a/1200/800'],
        ],
        [
            'id'     => 'd2',
            'title'  => 'So much Design',
            'desc'   => 'Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu.',
            'tags'   => ['InDesign', 'Photoshop', 'Typography'],
            'images' => ['https://picsum.photos/seed/d3a/1200/800'],
        ],
        [
            'id'     => 'd3',
            'title'  => 'So much more',
            'desc'   => 'Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis.',
            'tags'   => ['Cinema 4D', 'Illustrator', 'Packaging'],
            'images' => ['https://picsum.photos/seed/d3a/1200/800'],
        ],
    ];

    $it_projects = [
        [
            'id'        => 'i0',
            'title'     => 'IT Project',
            'tags'      => ['React', 'Node.js', 'WebSockets', 'PostgreSQL'],
            'desc'      => ['At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.'],
            'image_src' => 'https://picsum.photos/seed/it1/600/450',
            'image_alt' => 'Dashboard project',
        ],
        [
            'id'        => 'i1',
            'title'     => 'Some Development Stuff',
            'tags'      => ['Go', 'Docker', 'Kubernetes', 'Bash'],
            'desc'      => [
                'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.',
                'At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
            ],
            'image_src' => null,
            'image_alt' => null,
        ],
        [
            'id'        => 'i2',
            'title'     => 'Tricky Code and so on',
            'tags'      => ['Rust', 'WASM', 'IndexedDB', 'AES-256'],
            'desc'      => ['Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere.'],
            'image_src' => 'https://picsum.photos/seed/it3/600/450',
            'image_alt' => 'Notes App',
        ],
    ];

    $photos = [
        ['id' => 'p0',  'src' => 'https://picsum.photos/seed/ph1/800/600',  'title' => 'Golden Hour, Iceland',       'desc' => 'Shot on a mirrorless during the midnight sun. Long exposure, no filters.'],
        ['id' => 'p1',  'src' => 'https://picsum.photos/seed/ph2/600/900',  'title' => 'Portrait Study #4',           'desc' => 'Available light, north-facing window. Kodak Portra 400 emulation.'],
        ['id' => 'p2',  'src' => 'https://picsum.photos/seed/ph3/800/500',  'title' => 'Hamburg Harbour, Dawn',       'desc' => 'Pre-dawn fog rolling off the Elbe. 5am alarm well worth it.'],
        ['id' => 'p3',  'src' => 'https://picsum.photos/seed/ph4/700/700',  'title' => 'Geometry & Shadow',           'desc' => 'Brutalist stairwell, abandoned department store, natural light only.'],
        ['id' => 'p4',  'src' => 'https://picsum.photos/seed/ph5/900/600',  'title' => 'Open Water',                  'desc' => 'Baltic Sea in November. 1/2000s to freeze the wave crests.'],
        ['id' => 'p5',  'src' => 'https://picsum.photos/seed/ph6/600/800',  'title' => 'Street — Tokyo, 2023',        'desc' => 'Shinjuku at 2am. Ricoh GR IIIx, zone focus, single burst.'],
        ['id' => 'p6',  'src' => 'https://picsum.photos/seed/ph7/800/600',  'title' => 'Forest Interior',             'desc' => 'Old-growth beech forest, October. Mist reduces contrast beautifully.'],
        ['id' => 'p7',  'src' => 'https://picsum.photos/seed/ph8/1000/600', 'title' => 'Panorama — Lofoten',          'desc' => 'Stitched from 7 vertical frames. 100MP equivalent output.'],
        ['id' => 'p8',  'src' => 'https://picsum.photos/seed/ph9/600/900',  'title' => 'Still Life — Ceramics',       'desc' => 'Product photography for a local pottery studio.'],
        ['id' => 'p9',  'src' => 'https://picsum.photos/seed/ph10/800/600', 'title' => 'Commute',                     'desc' => 'U-Bahn window reflection. 1/60s, f/2, accepted the motion blur.'],
        ['id' => 'p10', 'src' => 'https://picsum.photos/seed/ph11/700/500', 'title' => 'The Red Boat',                'desc' => 'Alster lake, midday. Colour was the whole point.'],
        ['id' => 'p11', 'src' => 'https://picsum.photos/seed/ph12/800/800', 'title' => 'Square Study — Architecture', 'desc' => 'Symmetry hunting in the HafenCity district.'],
    ];

    foreach ($design_projects as $proj) {
        if (db_fetch_one($db, "SELECT id FROM design_projects WHERE id = ?", 's', [$proj['id']])) continue;
        db_run($db, "INSERT INTO design_projects (id, title, `desc`) VALUES (?,?,?)",
            'sss', [$proj['id'], $proj['title'], $proj['desc']]);
        save_design_relations($db, $proj['id'], $proj['tags'], $proj['images']);
    }

    foreach ($it_projects as $proj) {
        if (db_fetch_one($db, "SELECT id FROM it_projects WHERE id = ?", 's', [$proj['id']])) continue;
        db_run($db, "INSERT INTO it_projects (id, title, image_src, image_alt) VALUES (?,?,?,?)",
            'ssss', [$proj['id'], $proj['title'], $proj['image_src'], $proj['image_alt']]);
        save_it_relations($db, $proj['id'], $proj['tags'], $proj['desc']);
    }

    foreach ($photos as $photo) {
        if (db_fetch_one($db, "SELECT id FROM photos WHERE id = ?", 's', [$photo['id']])) continue;
        db_run($db, "INSERT INTO photos (id, src, title, `desc`) VALUES (?,?,?,?)",
            'ssss', [$photo['id'], $photo['src'], $photo['title'], $photo['desc']]);
    }

    respond(200, ['detail' => $reset ? 'Database reset and reseeded.' : 'Default data seeded.']);
}
