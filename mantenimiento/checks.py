"""Auditoría mecánica de HTML.

Uso: python mantenimiento/checks.py [archivo.html ...]   (por defecto index.html)

Detecta: etiquetas sin cerrar o mal anidadas, ids duplicados, anclas href="#x"
sin destino, src/href locales que no existen, <img> sin atributo alt y
target="_blank" sin rel="noopener". Sale con código 1 si encuentra errores.
"""
import os
import sys
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit

VACIAS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link",
          "meta", "param", "source", "track", "wbr"}
# Etiquetas cuyo cierre es opcional en HTML5.
CIERRE_OPCIONAL = {"p", "li", "dt", "dd", "option", "optgroup", "tr", "td", "th",
                   "thead", "tbody", "tfoot", "colgroup", "rt", "rp"}


class Auditor(HTMLParser):
    def __init__(self, ruta):
        super().__init__(convert_charrefs=True)
        self.ruta = ruta
        self.base = os.path.dirname(os.path.abspath(ruta))
        self.pila = []
        self.ids = {}
        self.anclas = []
        self.errores = []

    def error(self, linea, msg):
        self.errores.append((linea, msg))

    def handle_starttag(self, tag, attrs):
        self._atributos(tag, dict(attrs))
        if tag not in VACIAS:
            self.pila.append((tag, self.getpos()[0]))

    def handle_startendtag(self, tag, attrs):
        self._atributos(tag, dict(attrs))

    def handle_endtag(self, tag):
        linea = self.getpos()[0]
        if tag in VACIAS:
            return
        if not any(t == tag for t, _ in self.pila):
            self.error(linea, f"</{tag}> sin apertura")
            return
        while self.pila:
            abierta, desde = self.pila.pop()
            if abierta == tag:
                break
            if abierta not in CIERRE_OPCIONAL:
                self.error(desde, f"<{abierta}> sin cerrar (cerrada implícitamente por </{tag}> en la línea {linea})")

    def _atributos(self, tag, a):
        linea = self.getpos()[0]
        if "id" in a:
            if a["id"] in self.ids:
                self.error(linea, f'id duplicado "{a["id"]}" (también en la línea {self.ids[a["id"]]})')
            else:
                self.ids[a["id"]] = linea
        if tag == "img" and "alt" not in a:
            self.error(linea, f'<img src="{a.get("src", "")}"> sin atributo alt')
        if a.get("target") == "_blank":
            rel = (a.get("rel") or "").lower().split()
            if "noopener" not in rel and "noreferrer" not in rel:
                self.error(linea, f'target="_blank" sin rel="noopener": {a.get("href", "")}')
        href = a.get("href")
        if href is not None and href.startswith("#") and len(href) > 1:
            self.anclas.append((linea, href[1:]))
        for attr in ("src", "href"):
            valor = a.get(attr)
            if valor is not None and tag in ("a", "link", "script", "img", "source", "iframe"):
                self._local(linea, attr, valor)

    def _local(self, linea, attr, valor):
        partes = urlsplit(valor)
        if partes.scheme or valor.startswith("//") or valor.startswith("#") or not partes.path:
            return
        ruta = os.path.normpath(os.path.join(self.base, unquote(partes.path)))
        if not os.path.exists(ruta):
            self.error(linea, f'{attr} local inexistente: "{valor}"')

    def cerrar(self):
        self.close()
        for tag, desde in self.pila:
            if tag not in CIERRE_OPCIONAL:
                self.error(desde, f"<{tag}> sin cerrar al final del archivo")
        for linea, destino in self.anclas:
            if destino not in self.ids:
                self.error(linea, f'ancla "#{destino}" sin destino')
        return sorted(self.errores)


def main(rutas):
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    total = 0
    for ruta in rutas:
        auditor = Auditor(ruta)
        with open(ruta, encoding="utf-8") as f:
            auditor.feed(f.read())
        errores = auditor.cerrar()
        total += len(errores)
        for linea, msg in errores:
            print(f"{ruta}:{linea}: {msg}")
        print(f"{ruta}: {len(errores)} error(es)")
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:] or ["index.html"]))
