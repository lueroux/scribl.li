<?php
/**
 * Contact Form Handler for Scribl.li
 * Processes form submissions and sends emails
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Configuration
$toEmail = 'contact@scriblli.com'; // Replace with actual email
$fromEmail = 'noreply@scriblli.com';

// Response array
$response = [
    'success' => false,
    'message' => '',
    'errors' => []
];

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    $response['message'] = 'Method not allowed';
    echo json_encode($response);
    exit;
}

// Get JSON input
$jsonInput = file_get_contents('php://input');
$data = json_decode($jsonInput, true);

if (!$data) {
    $response['message'] = 'Invalid JSON data';
    echo json_encode($response);
    exit;
}

// Validate required fields
$requiredFields = ['name', 'email', 'message'];
foreach ($requiredFields as $field) {
    if (empty($data[$field])) {
        $response['errors'][$field] = ucfirst($field) . ' is required';
    }
}

// Validate email
if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    $response['errors']['email'] = 'Please enter a valid email address';
}

// If there are errors, return them
if (!empty($response['errors'])) {
    http_response_code(400);
    $response['message'] = 'Please fix the errors below';
    echo json_encode($response);
    exit;
}

// Sanitize input
$name = htmlspecialchars($data['name'], ENT_QUOTES, 'UTF-8');
$email = htmlspecialchars($data['email'], ENT_QUOTES, 'UTF-8');
$subject = isset($data['subject']) ? htmlspecialchars($data['subject'], ENT_QUOTES, 'UTF-8') : 'Contact Form Submission';
$message = htmlspecialchars($data['message'], ENT_QUOTES, 'UTF-8');
$phone = isset($data['phone']) ? htmlspecialchars($data['phone'], ENT_QUOTES, 'UTF-8') : '';

// Create email
$emailSubject = "Scribl.li Contact: {$subject}";
$emailBody = "
    <html>
    <head>
        <title>{$emailSubject}</title>
    </head>
    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
        <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
            <h2 style='color: #4f46e5;'>New Contact Form Submission</h2>
            <hr style='border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;'>
            
            <p><strong>Name:</strong> {$name}</p>
            <p><strong>Email:</strong> {$email}</p>";
            
if (!empty($phone)) {
    $emailBody .= "<p><strong>Phone:</strong> {$phone}</p>";
}

$emailBody .= "
            <p><strong>Subject:</strong> {$subject}</p>
            <p><strong>Message:</strong></p>
            <div style='background-color: #f9fafb; padding: 15px; border-radius: 5px; margin-top: 10px;'>
                " . nl2br($message) . "
            </div>
            
            <hr style='border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;'>
            <p style='font-size: 12px; color: #6b7280;'>
                This email was sent from the Scribl.li contact form on " . date('Y-m-d H:i:s') . "
            </p>
        </div>
    </body>
    </html>
";

// Headers
$headers = [
    'From: ' . $fromEmail,
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8'
];

// Send email
if (mail($toEmail, $emailSubject, $emailBody, implode("\r\n", $headers))) {
    // Send auto-response to user
    $autoResponseSubject = "Thank you for contacting Scribl.li";
    $autoResponseBody = "
        <html>
        <head>
            <title>{$autoResponseSubject}</title>
        </head>
        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
            <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                <h2 style='color: #4f46e5;'>Thank you for contacting Scribl.li!</h2>
                <p>Hi {$name},</p>
                <p>We've received your message and will get back to you within 24 hours.</p>
                <p>Here's a copy of your message:</p>
                <div style='background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                    " . nl2br($message) . "
                </div>
                <p>Best regards,<br>The Scribl.li Team</p>
                <hr style='border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;'>
                <p style='font-size: 12px; color: #6b7280;'>
                    This is an automated message. Please do not reply to this email.
                </p>
            </div>
        </body>
        </html>
    ";
    
    $autoResponseHeaders = [
        'From: ' . $fromEmail,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8'
    ];
    
    mail($email, $autoResponseSubject, $autoResponseBody, implode("\r\n", $autoResponseHeaders));
    
    $response['success'] = true;
    $response['message'] = 'Your message has been sent successfully!';
    
    // Log the submission (optional)
    logContactSubmission($name, $email, $subject, $message);
    
} else {
    http_response_code(500);
    $response['message'] = 'Failed to send message. Please try again later.';
    
    // Log the error
    error_log('Failed to send contact form email: ' . error_get_last()['message']);
}

echo json_encode($response);

/**
 * Log contact submissions to a file
 */
function logContactSubmission($name, $email, $subject, $message) {
    $logFile = __DIR__ . '/contact_submissions.log';
    $logEntry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'name' => $name,
        'email' => $email,
        'subject' => $subject,
        'message' => $message,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ];
    
    file_put_contents($logFile, json_encode($logEntry) . "\n", FILE_APPEND | LOCK_EX);
}

/**
 * Handle newsletter subscription
 */
if (isset($data['action']) && $data['action'] === 'newsletter') {
    $email = $data['email'];
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['errors']['email'] = 'Please enter a valid email address';
        echo json_encode($response);
        exit;
    }
    
    // Here you would typically:
    // 1. Validate the email
    // 2. Check if it's already subscribed
    // 3. Add to your newsletter service (Mailchimp, SendGrid, etc.)
    // 4. Send confirmation email
    
    // For demo purposes, we'll just log it
    $logFile = __DIR__ . '/newsletter_subscriptions.log';
    $logEntry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'email' => $email,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ];
    
    file_put_contents($logFile, json_encode($logEntry) . "\n", FILE_APPEND | LOCK_EX);
    
    $response['success'] = true;
    $response['message'] = 'Successfully subscribed to newsletter!';
    echo json_encode($response);
    exit;
}
?>
