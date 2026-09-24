<?php
// Reemplazo de sendmail solo para pruebas locales: guarda cada correo en mantenimiento/capturas/mails/.
$dir = __DIR__ . '/capturas/mails';
if ( !is_dir( $dir ) ) {
    mkdir( $dir, 0777, true );
}
file_put_contents( $dir . '/' . microtime( true ) . '.eml', stream_get_contents( STDIN ) );
