<?php
/*ini_set( 'display_errors', 1 );
error_reporting( E_ALL );
*/

if ( !empty( $_POST ) ) {
    $nombre = $_POST["name"];
    $correo = $_POST["email"];
    $asunto = $_POST["subject"];
    $mensaje = $_POST["message"];
    // var_dump( $_POST );
    $from = "$correo";
    $to = "Info@pyfsasoftware.com.ar";
    $subject = "$nombre " . " " . " $asunto";
    $message = "$mensaje";
    $headers = $from;
    if ( mail( $to, $subject, $message, $headers ) ) {
        echo json_encode( array( "estado" => 200, "mensaje" => "Correo enviado exitosamente" ) );
    } else {
        echo json_encode( array( "estado" => 500, "mensaje" => "Error al enviar el correo, intentelo más tarde" ) );
    }

    } 
    else {
    header( "location: ../index.html" );
    }
?>