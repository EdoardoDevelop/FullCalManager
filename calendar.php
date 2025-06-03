<?php
header('Content-Type: application/json');

$host = 'localhost';
$dbname = 'calendar_db';
$user = 'root';
$pass = 'Asd,123456@';

$pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'list':
        $stmt = $pdo->query("SELECT * FROM events");
        $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Converti le date dal DB in formato UTC per FullCalendar
        foreach ($events as &$event) {
            if (!empty($event['start'])) {
                $event['start'] = convertToUtc($event['start']);
            }
            if (!empty($event['end'])) {
                $event['end'] = convertToUtc($event['end']);
            }
            
            if (!empty($event['extended_props'])) {
                $event['extendedProps'] = json_decode($event['extended_props'], true);
            } else {
                $event['extendedProps'] = [];
            }
            unset($event['extended_props']);
        }
        
        echo json_encode($events);
        break;

    case 'add':
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Estrai e prepara i dati
        $title = $data['title'] ?? '';
        $start = $data['start'] ?? null;
        $end = $data['end'] ?? $start; // Se non c'è end, usa start
        $allDay = $data['allDay'] ?? false;
        $className = $data['className'] ?? '';
        $extendedProps = $data['extendedProps'] ?? [];
        
        // Converti le date UTC in formato MySQL (locale)
        $startLocal = $start ? convertUtcToMysql($start) : null;
        $endLocal = $end ? convertUtcToMysql($end) : null;
        
        $stmt = $pdo->prepare("INSERT INTO events (title, start, end, allDay, className, extended_props) 
                               VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $title,
            $startLocal,
            $endLocal,
            $allDay ? 1 : 0,
            $className,
            json_encode($extendedProps)
        ]);
        
        // Restituisci l'evento creato con ID (mantenendo le date in UTC)
        $newEvent = [
            'id' => $pdo->lastInsertId(),
            'title' => $title,
            'start' => $start,
            'end' => $end,
            'allDay' => $allDay,
            'className' => $className,
            'extendedProps' => $extendedProps
        ];
        
        echo json_encode($newEvent);
        break;

    case 'update':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID mancante']);
            exit;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Estrai e prepara i dati
        $title = $data['title'] ?? '';
        $start = $data['start'] ?? null;
        $end = $data['end'] ?? $start; // Se non c'è end, usa start
        $allDay = $data['allDay'] ?? false;
        $className = $data['className'] ?? '';
        $extendedProps = $data['extendedProps'] ?? [];
        
        // Converti le date UTC in formato MySQL (locale)
        $startLocal = $start ? convertUtcToMysql($start) : null;
        $endLocal = $end ? convertUtcToMysql($end) : null;
        
        $stmt = $pdo->prepare("UPDATE events SET 
                                title = ?, 
                                className = ?, 
                                start = ?, 
                                end = ?, 
                                allDay = ?,
                                extended_props = ?
                               WHERE id = ?");
                               
        $stmt->execute([
            $title,
            $className,
            $startLocal,
            $endLocal,
            $allDay ? 1 : 0,
            json_encode($extendedProps),
            $id
        ]);
        
        echo json_encode(['success' => true]);
        break;

    case 'delete':
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID mancante']);
            exit;
        }
        
        $stmt = $pdo->prepare("DELETE FROM events WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Azione non valida']);
        break;
}

/**
 * Converte una data UTC in formato MySQL (locale)
 */
function convertUtcToMysql(string $utcDate, string $timezone = 'Europe/Rome'): string {
    try {
        $date = new DateTime($utcDate, new DateTimeZone('UTC'));
        $date->setTimezone(new DateTimeZone($timezone));
        return $date->format('Y-m-d H:i:s');
    } catch (Exception $e) {
        return $utcDate; // Fallback in caso di errore
    }
}

/**
 * Converte una data dal DB in formato UTC per FullCalendar
 */
function convertToUtc(string $mysqlDate, string $timezone = 'Europe/Rome'): string {
    try {
        $date = new DateTime($mysqlDate, new DateTimeZone($timezone));
        $date->setTimezone(new DateTimeZone('UTC'));
        return $date->format('Y-m-d\TH:i:s\Z');
    } catch (Exception $e) {
        return $mysqlDate; // Fallback in caso di errore
    }
}