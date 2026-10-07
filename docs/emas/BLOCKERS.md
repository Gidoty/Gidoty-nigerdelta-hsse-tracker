# EMAS Step 1 — Blockers (Tasks B and C)

Both tasks below could not be carried out in this session. Per the
session's hard rules ("if something cannot be found or downloaded, say
so — do not substitute"), nothing was invented or assumed to fill the
gap, and no workaround or alternate route was attempted.

## Task B — Public flare data: blocked before any download

All three URLs given for Task B and C were attempted (`curl` directly,
then confirmed with `WebFetch`). All three failed identically:

```
curl -sS -o /dev/null -w "%{http_code}" https://www.worldbank.org/en/programs/gasflaringreduction/global-flaring-data
curl: (56) CONNECT tunnel failed, response 403
```

The session's outbound-network proxy status
(`curl $HTTPS_PROXY/__agentproxy/status`) and its own README confirm the
cause: *"The destination host is not allowed by your organization's
egress policy for this session... Do not retry or route around it —
report the blocked host."* This is a session-level network policy, not a
site login wall, a robots/terms block, or a transient failure — retrying
would not help, so it was not retried beyond the one confirmation call
each.

Exact URLs blocked (these are the ones given in the task; this session
never reached far enough to discover the specific CSV/XLSX/shapefile
download links on either page, since even the landing pages themselves
are unreachable):

- `https://www.worldbank.org/en/programs/gasflaringreduction/global-flaring-data`
  (World Bank GFMR, individual flare sites)
- `https://eogdata.mines.edu/products/vnf/global_gas_flare.html`
  (Earth Observation Group, annual flared gas volume)

**Nothing downstream of this was attempted**: no files exist under
`data/public/`, `data/public/raw/`, or `data/public/PROVENANCE.md`; no
Nigerian-site counts, volumes, column lists, or reference-condition
wording can be reported, because no raw file was ever obtained. Writing
`scripts/emas/extract_nigeria.py` against a guessed column schema was
deliberately not done either — without the actual provider files, any
column names or units in that script would be invented, which the hard
rules forbid.

**To unblock:** download the site-level files yourself (by hand, outside
this session) from the two URLs above, for the most recent three
available years, and either (a) add this session's network access to
your organization's egress allowlist for these two hosts and re-run this
step, or (b) hand the downloaded raw files to a future step directly so
Task B's provenance recording, extraction script, and reporting can run
against real files.

## Task C — NOSDRA Oil Spill Monitor: blocked, could not check

```
curl -sS -o /dev/null -w "%{http_code}" https://nosdra.oilspillmonitor.ng/
curl: (56) CONNECT tunnel failed, response 403
```

Same cause as above. This session could not load the page at all, so it
cannot report whether an official data export exists, what format it is
in, or what terms of use apply — reporting any of that without having
seen the page would mean inventing it, which the hard rules forbid. The
only existing references to "NOSDRA Oil Spill Monitor" in this repository
(`app/src/utils/evidenceStatus.js`, translation strings, and
`docs/MANUSCRIPT_CHANGES.md`) are to it as a named external-record type
reporters can cite when upgrading a report's evidence status — none of
them describe the site's own data export or terms, so they do not answer
this task either.

**To unblock:** visit `https://nosdra.oilspillmonitor.ng/` directly and
report back what exists (data export, API, terms of use page), or grant
this session network access to that host.
