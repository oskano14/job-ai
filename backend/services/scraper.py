from __future__ import annotations

import os
from typing import Any

import httpx


SERPAPI_BASE_URL = os.environ.get("SERPAPI_BASE_URL", "https://serpapi.com/search.json")


def _as_str(value: Any) -> str:
    return value.strip() if isinstance(value, str) else ""


def _extract_job_link(job: dict[str, Any]) -> str:
    apply_options = job.get("apply_options")
    if isinstance(apply_options, list) and apply_options:
        first = apply_options[0]
        if isinstance(first, dict):
            link = _as_str(first.get("link"))
            if link:
                return link

    related_links = job.get("related_links")
    if isinstance(related_links, list) and related_links:
        first = related_links[0]
        if isinstance(first, dict):
            link = _as_str(first.get("link"))
            if link:
                return link

    return ""


async def get_google_jobs(query: str, location: str = "France", contract_type: str = None) -> list[dict[str, str | None]]:
    """
    Paramètres ajoutés :
    - location : Ville ou région
    - contract_type : CDI, Stage, Alternance, etc.
    """
    query = (query or "").strip()
    if not query:
        return []

    # On enrichit la requête avec le type de contrat si présent
    full_query = query
    if contract_type:
        full_query += f" {contract_type}"

    api_key = os.environ.get("SERPAPI_API_KEY")
    if not api_key:
        raise RuntimeError("SERPAPI_API_KEY manquant.")

    params = {
        "engine": "google_jobs",
        "q": full_query,
        "api_key": api_key,
        "hl": "fr",
        "gl": "fr",
        "location": location, # Utilisation de la localisation dynamique
    }
    
    # ... reste du code httpx inchangé ...

    timeout_s = float(os.environ.get("SERPAPI_TIMEOUT_S", "30"))
    async with httpx.AsyncClient(timeout=timeout_s) as client:
        resp = await client.get(SERPAPI_BASE_URL, params=params)

    if resp.status_code >= 400:
        raise RuntimeError(f"Erreur SerpApi ({resp.status_code}): {resp.text}")

    data = resp.json()
    if isinstance(data, dict) and data.get("error"):
        raise RuntimeError(f"Erreur SerpApi: {data.get('error')}")

    jobs_results = data.get("jobs_results") if isinstance(data, dict) else None
    if jobs_results is None:
        # Retry automatique si SerpApi ne retourne pas de jobs_results
        for suffix in ("recrutement", "emploi"):
            retry_query = f"{query} {suffix}".strip()
            params["q"] = retry_query
            async with httpx.AsyncClient(timeout=timeout_s) as client:
                resp = await client.get(SERPAPI_BASE_URL, params=params)
            if resp.status_code >= 400:
                continue
            data = resp.json()
            jobs_results = data.get("jobs_results") if isinstance(data, dict) else None
            if jobs_results is not None:
                break
    jobs_list: list[dict[str, Any]] = []

    if isinstance(jobs_results, dict) and isinstance(jobs_results.get("jobs"), list):
        jobs_list = [j for j in jobs_results["jobs"] if isinstance(j, dict)]
    elif isinstance(jobs_results, list):
        jobs_list = [j for j in jobs_results if isinstance(j, dict)]

    offers: list[dict[str, str | None]] = []
    for job in jobs_list:
        title = _as_str(job.get("title"))
        company_name = _as_str(job.get("company_name"))
        location = _as_str(job.get("location"))
        thumbnail = _as_str(job.get("thumbnail")) or None
        link = _extract_job_link(job) or None

        if not title and not company_name and not location:
            continue

        offers.append(
            {
                "title": title or "Offre",
                "company_name": company_name or "Entreprise",
                "location": location or "—",
                "thumbnail": thumbnail,
                "link": link,
            }
        )

    return offers
