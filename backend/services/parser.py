from __future__ import annotations

from pathlib import Path


def extract_text(path: str | Path) -> str:
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"Fichier introuvable: {path}")

    suffix = path.suffix.lower()
    if suffix != ".pdf":
        raise ValueError("Format non supporté. Seul le PDF est accepté.")

    try:
        import fitz  # PyMuPDF  # type: ignore
    except Exception as exc:  # noqa: BLE001
        raise RuntimeError("Dépendance manquante: installe PyMuPDF (fitz) pour parser les PDF.") from exc

    try:
        doc = fitz.open(str(path))
    except Exception as exc:  # noqa: BLE001
        raise ValueError("PDF corrompu ou illisible.") from exc

    try:
        parts: list[str] = []
        for page in doc:
            parts.append(page.get_text("text") or "")
        text = "\n".join(parts).strip()
    finally:
        try:
            doc.close()
        except Exception:
            pass

    if not text:
        raise ValueError("Aucun texte extrait du document.")
    return text
