from __future__ import annotations

import os

import httpx


GROQ_BASE_URL = os.environ.get("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
# Note: `mixtral-8x7b-32768` a été déprécié côté Groq. Laisse `GROQ_MODEL` overridable via env.
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")


def _clip_text(value: str, max_chars: int) -> str:
    cleaned = " ".join(value.split())
    return cleaned[:max_chars]


async def _groq_chat(messages: list[dict[str, str]], *, max_tokens: int) -> str:
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY manquant (variable d'environnement).")

    url = f"{GROQ_BASE_URL.rstrip('/')}/chat/completions"
    payload = {
        "model": GROQ_MODEL,
        "messages": messages,
        "temperature": 0.2,
        "max_tokens": max_tokens,
        "top_p": 1,
        "stream": False,
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    timeout_s = float(os.environ.get("GROQ_TIMEOUT_S", "60"))
    async with httpx.AsyncClient(timeout=timeout_s) as client:
        resp = await client.post(url, json=payload, headers=headers)

    if resp.status_code >= 400:
        try:
            err = resp.json().get("error", {})
            code = err.get("code")
            message = err.get("message") or resp.text
            if code == "model_decommissioned":
                raise RuntimeError(
                    "Le modèle Groq configuré est décommissionné. "
                    "Mets à jour `GROQ_MODEL` (ex: `llama-3.3-70b-versatile`). "
                    f"Détail: {message}"
                )
            raise RuntimeError(f"Erreur Groq ({resp.status_code}): {message}")
        except RuntimeError:
            raise
        except Exception as exc:  # noqa: BLE001
            raise RuntimeError(f"Erreur Groq ({resp.status_code}): {resp.text}") from exc

    data = resp.json()
    try:
        content = data["choices"][0]["message"]["content"]
    except Exception as exc:  # noqa: BLE001
        raise RuntimeError(f"Réponse Groq inattendue: {data!r}") from exc

    if not isinstance(content, str) or not content.strip():
        raise RuntimeError("Réponse Groq vide.")
    return content.strip()


def _build_prompt(cv_text: str) -> list[dict[str, str]]:
    system = (
        "Tu es ALEX, un coach RH senior spécialisé en recrutement et optimisation de CV. "
        "Personnalité: expert RH au teint ébène, lunettes et petit afro. "
        "Ton: bienveillant, direct, très concret. Langue: français. "
        "Tu rédiges toujours en Markdown."
        "\n\n"
        "Objectif: auditer le CV fourni et proposer des améliorations actionnables."
        "\n\n"
        "Contraintes de format (obligatoires):\n"
        "1) Réponds exclusivement en Markdown.\n"
        "2) Structure exactement en 3 sections avec ces titres (dans cet ordre):\n"
        "   # ✅ Points Forts\n"
        "   # ⚠️ Points d'Amélioration\n"
        "   # 🚀 Suggestions de Reformulation\n"
        "3) Sois spécifique: cite des exemples concrets, propose des reformulations prêtes à copier-coller.\n"
        "4) Si le CV manque d'informations, liste les questions à poser au candidat.\n"
        "5) Ne divulgue aucune clé API, ni informations techniques internes.\n"
    )

    user = (
        "Voici le texte extrait du CV (brut). Fais l'audit complet demandé:\n\n"
        "-----\n"
        f"{cv_text}\n"
        "-----\n"
    )

    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]


async def generate_audit_markdown(cv_text: str) -> str:
    max_chars = int(os.environ.get("ALEX_MAX_CHARS", "24000"))
    clipped = _clip_text(cv_text, max_chars)
    if not clipped:
        raise ValueError("Texte CV vide après extraction.")

    return await _groq_chat(_build_prompt(clipped), max_tokens=2048)


async def chat_with_alex(
    prompt: str,
    history: list[dict[str, str]] | None,
    cv_text: str,
    audit_text: str | None = None,
) -> str:
    prompt = prompt.strip()
    if not prompt:
        raise ValueError("Message vide.")

    max_cv_chars = int(os.environ.get("ALEX_CHAT_CV_MAX_CHARS", "24000"))
    cv_clipped = _clip_text(cv_text, max_cv_chars)
    if not cv_clipped:
        raise ValueError("cv_context vide.")

    max_history = int(os.environ.get("ALEX_CHAT_HISTORY_MAX", "16"))
    safe_history = (history or [])[-max_history:]

    system = (
        "Tu es ALEX, l'expert RH au teint ébène et lunettes rondes. "
        "Tu es en train de discuter avec un candidat au sujet de son CV.\n\n"
        "Réponds toujours de manière concise et encourageante en utilisant le format Markdown.\n"
        "Base-toi prioritairement sur le contenu du CV fourni en contexte.\n"
        "Ne recopie pas l'intégralité du CV; cite seulement des extraits pertinents.\n"
    )

    messages: list[dict[str, str]] = [
        {"role": "system", "content": system},
        {"role": "system", "content": f"cv_context (référence interne):\n{cv_clipped}"},
    ]

    if audit_text:
        max_audit_chars = int(os.environ.get("ALEX_CHAT_AUDIT_MAX_CHARS", "12000"))
        audit_clipped = _clip_text(audit_text, max_audit_chars)
        if audit_clipped:
            messages.append({"role": "system", "content": f"audit_context (référence interne):\n{audit_clipped}"})

    for m in safe_history:
        role = m.get("role")
        content = m.get("content")
        if role not in {"user", "assistant"}:
            continue
        if not isinstance(content, str) or not content.strip():
            continue
        messages.append({"role": role, "content": content.strip()})

    messages.append({"role": "user", "content": prompt})
    max_tokens = int(os.environ.get("ALEX_CHAT_MAX_TOKENS", "800"))
    return await _groq_chat(messages, max_tokens=max_tokens)


async def extract_job_search_theme(user_message: str) -> str:
    """
    Extrait un thème de recherche d'emploi (ex: "Data Analyst", "Product Manager IA").
    Important: ne pas estimer de pourcentage de correspondance pour le moment.
    """
    user_message = user_message.strip()
    if not user_message:
        raise ValueError("Message vide.")

    system = (
        "Tu es ALEX, coach RH. Tu aides à formuler une recherche d'emploi.\n"
        "Tu ne dois PAS estimer de score/compatibilité/% pour le moment.\n"
        "Ta mission est uniquement d'extraire le thème de recherche principal.\n"
        "Réponds uniquement avec le thème, en une seule ligne (sans Markdown, sans guillemets)."
    )

    content = await _groq_chat(
        [
            {"role": "system", "content": system},
            {"role": "user", "content": user_message},
        ],
        max_tokens=40,
    )
    return content.splitlines()[0].strip()


async def suggest_jobs_keyword_from_cv(cv_text: str) -> str:
    """
    Déduit un mot-clé de recherche d'offres (intitulé de poste) à partir du CV.
    Important: pas de score/compatibilité/%.
    """
    max_chars = int(os.environ.get("ALEX_JOBS_KEYWORD_MAX_CHARS", "8000"))
    clipped = _clip_text(cv_text, max_chars)
    if not clipped:
        raise ValueError("cv_context vide.")

    system = (
        "Tu es ALEX, coach RH. Ta mission: proposer UN mot-clé de recherche d'emploi "
        "(intitulé de poste) cohérent avec le CV.\n"
        "Tu ne dois PAS estimer de score/compatibilité/%.\n"
        "Réponds uniquement avec le mot-clé, sur une seule ligne, sans Markdown, sans guillemets.\n"
        "Exemples: Data Analyst, Product Manager, Développeur Frontend React.\n"
    )

    content = await _groq_chat(
        [
            {"role": "system", "content": system},
            {"role": "user", "content": clipped},
        ],
        max_tokens=40,
    )
    return content.splitlines()[0].strip()
