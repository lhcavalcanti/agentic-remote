# Third-party notices

## Graphify 0.9.54

Generated graph/report data and the HTML viewer template use
[Graphify](https://github.com/Graphify-Labs/graphify).

Copyright 2026 Safi Shamsi and the Graphify contributors.

Graphify is licensed under Apache-2.0; portions contributed before relicensing
remain available under MIT. The upstream [NOTICE](licenses/Graphify-NOTICE.txt),
[Apache license](licenses/Graphify-APACHE-2.0.txt), and retained
[MIT license](licenses/Graphify-MIT.txt) are included.

The generated viewer is adapted to embed its dependency, enforce an offline
content security policy, identify this repository's snapshot, and seed its
layout. These adaptations live in `manage.py`; upstream source is not patched.

## vis-network 9.1.6

`vendor/vis-network.min.js` comes from the exact asset referenced by Graphify:

`https://unpkg.com/vis-network@9.1.6/standalone/umd/vis-network.min.js`

Its upstream copyright/license headers are retained, and the
[MIT license](licenses/vis-network-MIT.txt) is included. The file's SHA-384
integrity value is pinned in `scope.json` and checked before embedding it in
`graph.html`.
