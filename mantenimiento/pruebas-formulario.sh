#!/usr/bin/env bash
# Prueba forms/contact.php contra un servidor local que no envía correos reales.
# Uso (desde la raíz del repo): bash mantenimiento/pruebas-formulario.sh
# Levanta php -S en 127.0.0.1:8081 con sendmail_path apuntando a mantenimiento/capturar-mail.php.
set -u
cd "$(dirname "$0")/.."
MAILS=mantenimiento/capturas/mails
rm -rf "$MAILS"; mkdir -p "$MAILS"
PHPEXE=$(command -v php); RAIZ=$(pwd)
command -v cygpath >/dev/null && { PHPEXE=$(cygpath -m "$PHPEXE"); RAIZ=$(cygpath -m "$RAIZ"); }
php -d sendmail_path="$PHPEXE $RAIZ/mantenimiento/capturar-mail.php" -S 127.0.0.1:8081 >/dev/null 2>&1 &
PID=$!
trap 'kill $PID 2>/dev/null' EXIT
sleep 1
U=http://127.0.0.1:8081/forms/contact.php
FALLAS=0
caso() { # caso <descripción> <respuesta esperada> <args de curl...>
  local desc=$1 esperado=$2; shift 2
  local r; r=$(curl -s -w '|%{http_code}' "$@" "$U")
  if [ "$r" = "$esperado|200" ]; then echo "ok    $desc"; else echo "FALLA $desc -> $r"; FALLAS=$((FALLAS+1)); fi
}
BASE=(-d "name=Juan%20P%C3%A9rez" -d "email=juan@example.com" -d "subject=Cotizaci%C3%B3n" -d "message=Hola%0d%0aSegunda%20l%C3%ADnea")
V='Completá todos los campos.'; I='Los datos ingresados no son válidos.'; E='Ingresá un correo válido.'; L='El nombre, el asunto o el mensaje son demasiado largos.'

LOC=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$U")
case "$LOC" in 302*index.html) echo "ok    GET directo redirige ($LOC)";; *) echo "FALLA GET directo -> $LOC"; FALLAS=$((FALLAS+1));; esac
caso "POST válido"                  OK "${BASE[@]}"
caso "campo vacío"                  "$V" -d "name=" -d "email=juan@example.com" -d "subject=x" -d "message=y"
caso "solo espacios"                "$V" -d "name=%20%20" -d "email=juan@example.com" -d "subject=x" -d "message=y"
caso "POST sin datos"               "$V" -X POST
caso "campo como array"             "$V" -d "name[]=Juan" -d "email=juan@example.com" -d "subject=x" -d "message=y"
caso "email inválido"               "$E" -d "name=Juan" -d "email=juan@@example" -d "subject=x" -d "message=y"
caso "inyección en email"           "$I" -d "name=Juan" -d "email=juan@example.com%0d%0aBcc:v@example.com" -d "subject=x" -d "message=y"
caso "inyección en nombre"          "$I" -d "name=Juan%0d%0aBcc:v@example.com" -d "email=juan@example.com" -d "subject=x" -d "message=y"
caso "inyección en asunto"          "$I" -d "name=Juan" -d "email=juan@example.com" -d "subject=x%0d%0aBcc:v@example.com" -d "message=y"
caso "solo LF en asunto"            "$I" -d "name=Juan" -d "email=juan@example.com" -d "subject=x%0aBcc:v@example.com" -d "message=y"
caso "honeypot lleno (no envía)"    OK "${BASE[@]}" -d "website=http://spam.example"
caso "nombre 100 letras con tilde"  OK -d "name=$(printf '%%C3%%A1%.0s' {1..100})" -d "email=juan@example.com" -d "subject=x" -d "message=y"
caso "nombre 101"                   "$L" -d "name=$(printf 'a%.0s' {1..101})" -d "email=juan@example.com" -d "subject=x" -d "message=y"
caso "asunto 151"                   "$L" -d "name=Juan" -d "email=juan@example.com" -d "subject=$(printf 'a%.0s' {1..151})" -d "message=y"
caso "mensaje 5001"                 "$L" -d "name=Juan" -d "email=juan@example.com" -d "subject=x" -d "message=$(printf 'a%.0s' {1..5001})"

# Solo los dos casos OK que no son honeypot deben haber generado correo.
N=$(ls "$MAILS" | wc -l)
if [ "$N" -eq 2 ]; then echo "ok    correos capturados: 2 (honeypot no envió)"; else echo "FALLA correos capturados: $N (esperados 2)"; FALLAS=$((FALLAS+1)); fi
PRIMERO=$(ls "$MAILS" | sort | head -1)
if grep -q '^From: PyFsa Software <info@pyfsasoftware.com.ar>' "$MAILS/$PRIMERO" && grep -q '^Reply-To: juan@example.com' "$MAILS/$PRIMERO" \
   && grep -q '^Content-Type: text/plain; charset=UTF-8' "$MAILS/$PRIMERO" && ! grep -qi '^Bcc' "$MAILS"/*; then
  echo "ok    cabeceras From/Reply-To/Content-Type correctas, sin Bcc"
else echo "FALLA cabeceras"; FALLAS=$((FALLAS+1)); fi

echo "Fallas: $FALLAS"
exit $FALLAS
