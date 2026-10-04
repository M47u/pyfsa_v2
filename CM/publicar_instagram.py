#!/usr/bin/env python3
"""Publica en Instagram las piezas aprobadas de la cola (cm/cola/*.md).

Uso:
  python publicar_instagram.py --validar     revisa el formato de todas las piezas (borradores incluidos)
  python publicar_instagram.py               simulacion: muestra que se publicaria
  python publicar_instagram.py --ejecutar    publica de verdad
  python publicar_instagram.py --verificar   comprueba que el token funciona
  python publicar_instagram.py --refrescar   renueva el token de larga duracion

Configuracion en cm/.env (nunca se sube al repositorio):
  IG_USER_ID=...          id de la cuenta profesional de Instagram
  IG_ACCESS_TOKEN=...     token de larga duracion
  MEDIA_BASE_URL=https://pyfsasoftware.com.ar/social/   (opcional)
  IG_HOST=graph.instagram.com                           (opcional; graph.facebook.com si usas Facebook Login)
  IG_API_VERSION=v23.0                                  (opcional; actualizar si Meta la retira)

Solo se publican las piezas con "estado: aprobado" cuya fecha ya llego.
"""
import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

BASE = Path(__file__).resolve().parent
COLA = BASE / "cola"
MEDIA = BASE / "media"
LOG = BASE / "publicaciones.log"
ART = timezone(timedelta(hours=-3))  # Argentina no tiene horario de verano


def cargar_env():
    ruta = BASE / ".env"
    if not ruta.exists():
        return
    for linea in ruta.read_text(encoding="utf-8").splitlines():
        linea = linea.strip()
        if linea and not linea.startswith("#") and "=" in linea:
            k, v = linea.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def config():
    return {
        "user_id": os.environ.get("IG_USER_ID", ""),
        "token": os.environ.get("IG_ACCESS_TOKEN", ""),
        "host": os.environ.get("IG_HOST", "graph.instagram.com"),
        "version": os.environ.get("IG_API_VERSION", "v23.0"),
        "media_base": os.environ.get("MEDIA_BASE_URL", "https://pyfsasoftware.com.ar/social/").rstrip("/") + "/",
    }


def log(mensaje):
    linea = f"{datetime.now(ART):%Y-%m-%d %H:%M:%S} {mensaje}"
    print(linea)
    with LOG.open("a", encoding="utf-8") as f:
        f.write(linea + "\n")


def leer(ruta):
    texto = ruta.read_text(encoding="utf-8")
    m = re.match(r"^---\r?\n(.*?)\r?\n---\r?\n?(.*)$", texto, re.S)
    if not m:
        raise ValueError("falta el bloque de metadatos entre lineas ---")
    meta = {}
    for linea in m.group(1).splitlines():
        if ":" in linea and not linea.lstrip().startswith("#"):
            k, v = linea.split(":", 1)
            meta[k.strip()] = v.strip()
    return meta, m.group(2).strip()


def guardar(ruta, meta, caption):
    cabecera = "\n".join(f"{k}: {v}" for k, v in meta.items())
    ruta.write_text(f"---\n{cabecera}\n---\n{caption}\n", encoding="utf-8")


def api(c, metodo, ruta, datos=None, host=None):
    url = f"https://{host or c['host']}/{c['version']}/{ruta}"
    cuerpo = None
    if metodo == "GET" and datos:
        url += "?" + urllib.parse.urlencode(datos)
    elif datos:
        cuerpo = urllib.parse.urlencode(datos).encode()
    req = urllib.request.Request(
        url, data=cuerpo, method=metodo,
        headers={"Authorization": f"Bearer {c['token']}"},
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        detalle = e.read().decode(errors="replace")[:300]
        raise RuntimeError(f"HTTP {e.code} en {ruta}: {detalle}")


def imagen_accesible(url):
    try:
        with urllib.request.urlopen(urllib.request.Request(url), timeout=20) as r:
            r.read(1)
            return r.status == 200 and "image/jpeg" in r.headers.get("Content-Type", "")
    except Exception:
        return False


def validar(meta, caption):
    errores = []
    tipo = meta.get("tipo", "")
    medios = [m.strip() for m in meta.get("medios", "").split(",") if m.strip()]
    if tipo not in ("imagen", "carrusel"):
        errores.append("tipo debe ser imagen o carrusel")
    if tipo == "imagen" and len(medios) != 1:
        errores.append("una imagen necesita exactamente 1 archivo en medios")
    if tipo == "carrusel" and not 2 <= len(medios) <= 10:
        errores.append("un carrusel necesita entre 2 y 10 archivos en medios")
    for m in medios:
        if not m.lower().endswith((".jpg", ".jpeg")):
            errores.append(f"{m}: Instagram requiere JPEG")
        elif not (MEDIA / m).exists():
            errores.append(f"{m}: no existe en cm/media/")
    if not caption:
        errores.append("el texto (caption) esta vacio")
    if len(caption) > 2200:
        errores.append(f"el texto tiene {len(caption)} caracteres (maximo 2200)")
    if len(re.findall(r"#\w+", caption)) > 30:
        errores.append("mas de 30 hashtags")
    try:
        datetime.strptime(meta.get("fecha", ""), "%Y-%m-%d %H:%M")
    except ValueError:
        errores.append("fecha invalida: usar AAAA-MM-DD HH:MM (hora de Argentina)")
    return errores, medios


def fecha_de(meta):
    return datetime.strptime(meta["fecha"], "%Y-%m-%d %H:%M").replace(tzinfo=ART)


def crear_contenedor(c, tipo, medios, caption, alt):
    urls = [c["media_base"] + m for m in medios]
    for u in urls:
        if not imagen_accesible(u):
            raise RuntimeError(f"la imagen no es accesible como JPEG publico: {u}")
    uid = c["user_id"]
    if tipo == "imagen":
        datos = {"image_url": urls[0], "caption": caption}
        if alt:
            datos["alt_text"] = alt
        return api(c, "POST", f"{uid}/media", datos)["id"]
    hijos = [
        api(c, "POST", f"{uid}/media", {"image_url": u, "is_carousel_item": "true"})["id"]
        for u in urls
    ]
    return api(c, "POST", f"{uid}/media", {
        "media_type": "CAROUSEL", "children": ",".join(hijos), "caption": caption,
    })["id"]


def esperar_contenedor(c, contenedor):
    for _ in range(30):
        estado = api(c, "GET", contenedor, {"fields": "status_code"}).get("status_code")
        if estado == "FINISHED":
            return
        if estado in ("ERROR", "EXPIRED"):
            raise RuntimeError(f"el contenedor quedo en estado {estado}")
        time.sleep(2)
    raise RuntimeError("el contenedor no quedo listo a tiempo")


def procesar(c, ruta, meta, caption):
    """Crea el contenedor y publica. Marca 'publicando' antes del paso final
    para no duplicar una publicacion si el script se corta a mitad."""
    _, medios = validar(meta, caption)
    contenedor = crear_contenedor(c, meta["tipo"], medios, caption, meta.get("alt", ""))
    esperar_contenedor(c, contenedor)
    meta["estado"] = "publicando"
    meta["contenedor"] = contenedor
    guardar(ruta, meta, caption)
    publicado = api(c, "POST", f"{c['user_id']}/media_publish", {"creation_id": contenedor})["id"]
    meta["estado"] = "publicado"
    meta["id_publicacion"] = publicado
    meta["publicado_el"] = f"{datetime.now(ART):%Y-%m-%d %H:%M}"
    try:
        meta["enlace"] = api(c, "GET", publicado, {"fields": "permalink"}).get("permalink", "")
    except RuntimeError:
        meta["enlace"] = ""
    guardar(ruta, meta, caption)


def publicadas_hoy():
    hoy = f"{datetime.now(ART):%Y-%m-%d}"
    n = 0
    for ruta in COLA.glob("*.md"):
        if ruta.name.startswith("_"):
            continue
        try:
            meta, _ = leer(ruta)
        except ValueError:
            continue
        if meta.get("estado") == "publicado" and meta.get("publicado_el", "").startswith(hoy):
            n += 1
    return n


def validar_cola():
    """Revisa el formato de las piezas pendientes sin publicar ni llamar a la API."""
    hay_errores = False
    for ruta in sorted(COLA.glob("*.md")):
        if ruta.name.startswith("_"):
            continue
        try:
            meta, caption = leer(ruta)
        except ValueError as e:
            print(f"{ruta.name}: ERROR {e}")
            hay_errores = True
            continue
        if meta.get("estado") not in ("borrador", "aprobado"):
            continue
        errores, _ = validar(meta, caption)
        if errores:
            hay_errores = True
            print(f"{ruta.name}: " + "; ".join(errores))
        else:
            print(f"{ruta.name}: ok ({meta.get('estado')})")
    return hay_errores


def verificar(c):
    datos = api(c, "GET", c["user_id"] or "me", {"fields": "username"})
    print(f"Token valido. Cuenta: @{datos.get('username', '?')}")


def refrescar(c):
    datos = api(c, "GET", "refresh_access_token", {
        "grant_type": "ig_refresh_token", "access_token": c["token"],
    }, host="graph.instagram.com")
    nuevo = datos["access_token"]
    ruta = BASE / ".env"
    texto = ruta.read_text(encoding="utf-8")
    ruta.write_text(re.sub(r"(?m)^IG_ACCESS_TOKEN=.*$", lambda _: f"IG_ACCESS_TOKEN={nuevo}", texto), encoding="utf-8")
    dias = int(datos.get("expires_in", 0)) // 86400
    print(f"Token renovado y guardado en .env. Vence en unos {dias} dias.")


def main():
    cargar_env()
    ap = argparse.ArgumentParser(description="Publica en Instagram las piezas aprobadas.")
    ap.add_argument("--ejecutar", action="store_true", help="publica de verdad (sin esto solo simula)")
    ap.add_argument("--validar", action="store_true", help="revisa el formato de todas las piezas sin publicar")
    ap.add_argument("--verificar", action="store_true")
    ap.add_argument("--refrescar", action="store_true")
    ap.add_argument("--max-dia", type=int, default=3, help="tope propio de publicaciones por dia (defecto 3)")
    args = ap.parse_args()
    c = config()

    if args.validar:
        COLA.mkdir(exist_ok=True)
        sys.exit(1 if validar_cola() else 0)

    if args.verificar or args.refrescar or args.ejecutar:
        faltan = [k for k, v in (("IG_USER_ID", c["user_id"]), ("IG_ACCESS_TOKEN", c["token"])) if not v]
        if faltan:
            sys.exit(f"Faltan en cm/.env: {', '.join(faltan)}")
    if args.verificar:
        return verificar(c)
    if args.refrescar:
        return refrescar(c)

    COLA.mkdir(exist_ok=True)
    ahora = datetime.now(ART)
    hechas = publicadas_hoy()
    hubo_errores = False

    for ruta in sorted(COLA.glob("*.md")):
        if ruta.name.startswith("_"):
            continue
        try:
            meta, caption = leer(ruta)
        except ValueError as e:
            log(f"{ruta.name}: no se pudo leer ({e})")
            hubo_errores = True
            continue
        estado = meta.get("estado", "")
        if estado == "publicando":
            log(f"{ruta.name}: quedo a medias. Revisar en Instagram si salio y corregir el estado a mano.")
            hubo_errores = True
            continue
        if estado != "aprobado":
            continue
        errores, _ = validar(meta, caption)
        if errores:
            log(f"{ruta.name}: no se publica -> " + "; ".join(errores))
            hubo_errores = True
            continue
        if fecha_de(meta) > ahora:
            print(f"{ruta.name}: aprobada, sale el {meta['fecha']}")
            continue
        if hechas >= args.max_dia:
            log(f"{ruta.name}: se alcanzo el tope de {args.max_dia} por dia, queda para la proxima corrida")
            continue
        if not args.ejecutar:
            log(f"{ruta.name}: SIMULACION, se publicaria ahora ({meta['tipo']})")
            hechas += 1
            continue
        try:
            procesar(c, ruta, meta, caption)
            hechas += 1
            log(f"{ruta.name}: publicada {meta.get('enlace', '')}")
        except Exception as e:  # noqa: BLE001
            hubo_errores = True
            meta, caption = leer(ruta)
            if meta.get("estado") != "publicando":
                meta["estado"] = "error"
            meta["error"] = str(e)[:300]
            guardar(ruta, meta, caption)
            log(f"{ruta.name}: ERROR {e}")
    sys.exit(1 if hubo_errores else 0)


if __name__ == "__main__":
    main()
