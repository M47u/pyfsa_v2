<?php
/*
 * Formulario de contacto de PyFsa Software.
 *
 * Lo consume assets/vendor/php-email-form/validate.js, que muestra éxito solo si
 * la respuesta es HTTP 200 con el texto exacto "OK". Cualquier otro texto (con
 * HTTP 200) se muestra al visitante como mensaje de error.
 */

ini_set( 'display_errors', '0' );

$destino   = 'info@pyfsasoftware.com.ar';
$remitente = 'info@pyfsasoftware.com.ar';

if ( ( $_SERVER['REQUEST_METHOD'] ?? '' ) !== 'POST' ) {
    header( 'Location: ../index.html' );
    exit;
}

header( 'Content-Type: text/plain; charset=UTF-8' );

function campo( $nombre ) {
    $valor = $_POST[ $nombre ] ?? '';
    return is_string( $valor ) ? trim( $valor ) : '';
}

function largo( $texto ) {
    return function_exists( 'mb_strlen' ) ? mb_strlen( $texto, 'UTF-8' ) : strlen( $texto );
}

function responder( $texto ) {
    echo $texto;
    exit;
}

// Honeypot: los visitantes no ven este campo; si llega completo es un bot.
// Se responde OK para no darle pistas, pero no se envía nada.
if ( campo( 'website' ) !== '' ) {
    responder( 'OK' );
}

$nombre  = campo( 'name' );
$correo  = campo( 'email' );
$asunto  = campo( 'subject' );
$mensaje = campo( 'message' );

if ( $nombre === '' || $correo === '' || $asunto === '' || $mensaje === '' ) {
    responder( 'Completá todos los campos.' );
}

// Ningún salto de línea en los datos que van a cabeceras (evita inyección).
if ( preg_match( '/[\r\n]/', $nombre . $correo . $asunto ) ) {
    responder( 'Los datos ingresados no son válidos.' );
}

if ( !filter_var( $correo, FILTER_VALIDATE_EMAIL ) ) {
    responder( 'Ingresá un correo válido.' );
}

if ( largo( $nombre ) > 100 || largo( $asunto ) > 150 || largo( $mensaje ) > 5000 ) {
    responder( 'El nombre, el asunto o el mensaje son demasiado largos.' );
}

if ( function_exists( 'mb_encode_mimeheader' ) ) {
    mb_internal_encoding( 'UTF-8' );
    $titulo = mb_encode_mimeheader( "$nombre - $asunto", 'UTF-8', 'B', "\r\n" );
} else {
    $titulo = '=?UTF-8?B?' . base64_encode( "$nombre - $asunto" ) . '?=';
}

$cuerpo = "Nombre: $nombre\r\n"
        . "Correo: $correo\r\n"
        . "Asunto: $asunto\r\n\r\n"
        . preg_replace( '/\r\n|\r|\n/', "\r\n", $mensaje ) . "\r\n";

$cabeceras = "From: PyFsa Software <$remitente>\r\n"
           . "Reply-To: $correo\r\n"
           . "MIME-Version: 1.0\r\n"
           . "Content-Type: text/plain; charset=UTF-8\r\n"
           . "Content-Transfer-Encoding: 8bit";

if ( mail( $destino, $titulo, $cuerpo, $cabeceras ) ) {
    responder( 'OK' );
}

responder( 'No pudimos enviar tu mensaje. Probá de nuevo más tarde.' );
