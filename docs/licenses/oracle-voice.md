# Oracle voice asset notices

Agentic Remote itself remains MIT-licensed. Voice models and Piper are not
bundled into the application release: `voice-install` downloads the exact
third-party files named in `config/oracle-voice-profiles.json` only after an
operator selects a profile. Each installation writes the applicable URLs to
its `NOTICES.txt`.

| Asset | Upstream terms |
| --- | --- |
| sherpa-onnx Zipformer English 20M archive | Model card declares Apache-2.0: <https://www.apache.org/licenses/LICENSE-2.0> |
| NVIDIA Nemotron 3.5 model converted for sherpa-onnx | OpenMDW-1.1: <https://openmdw.ai/license/1-1/> |
| Piper standalone `2023.11.14-2` | Piper source release is MIT: <https://github.com/rhasspy/piper/blob/2023.11.14-2/LICENSE.md> |
| eSpeak NG inside the standalone Piper archive | GPL-3.0-or-later: <https://github.com/espeak-ng/espeak-ng/blob/1.52.0/COPYING> |
| Lessac medium voice training material | Research-only Lessac/Voice Factory licence: <https://www.cstr.ed.ac.uk/projects/blizzard/2013/lessac_blizzard2013/license.html> |
| Faber medium training data | CC0-1.0: <https://creativecommons.org/publicdomain/zero/1.0/legalcode.en> |
| Piper voices repository metadata | MIT: <https://huggingface.co/rhasspy/piper-voices/raw/main/README.md> |

The Lessac training-material licence restricts use to research and excludes
commercial speech products. Operators must determine whether their intended use
is permitted; `fast-en` is not a blanket commercial-use grant.

The standalone Piper archive contains eSpeak NG libraries and data. Running an
unmodified local copy is distinct from incorporating Piper into Agentic Remote,
but conveying or redistributing that archive can trigger GPL requirements,
including preserving notices and providing corresponding source as required by
the licence. Piper 1.8, used for the development benchmark, is itself published
as GPL-3.0-or-later and embeds eSpeak NG:
<https://github.com/OHF-Voice/piper1-gpl/blob/v1.8.0/COPYING>.

OpenMDW-1.1 requires a distributed copy of the agreement and applicable
copyright/origin notices. The installer records the authoritative license URL;
any redistribution process must carry the actual required materials, not rely
only on this summary.

This document records upstream terms and is not legal advice.
