# Threat Tracing for a Changed Diff

## Map the boundary

For each changed entry point, identify:

- actor and authentication state;
- tenant, object, and operation being accessed;
- untrusted fields and their parser or validator;
- sensitive data read or written;
- privileged sinks such as database queries, filesystem paths, templates, processes, outbound requests, deserializers, or secret-bearing logs;
- framework protections and downstream authorization checks;
- deployment context and realistic attacker reachability.

Trace data end to end. A suspicious sink is not a finding without a controllable source and a missing protection on the actual path.

## High-value review paths

- Object IDs accepted by a route and passed to a service without actor-scoped lookup.
- Tenant scope applied to list reads but omitted from detail, mutation, export, or background job paths.
- Validated input reconstructed from raw request values later in the flow.
- User-controlled URL reaching a server request with access to internal or cloud metadata networks.
- File name or archive entry reaching a path without canonical containment checks.
- Rich text bypassing framework escaping through raw HTML APIs.
- Webhook processing without signature verification, replay protection, or idempotency.
- Sensitive fields entering analytics, errors, shared caches, logs, or browser DTOs.
- Authorization performed only in the client while the server mutation trusts supplied ownership.

## Exploitability filter

Before reporting, state attacker capability, required access, controlled input, exact path, missing control, affected resource, and resulting impact. Check whether validation, escaping, parameterization, framework behavior, network policy, or a later authorization gate closes the path.

Exclude generic hardening, dependency age without an exploitable changed path, test-only code, resource exhaustion, speculative timing attacks, and pre-existing issues. Report medium or high severity only when the exploit path is concrete and confidence is strong.

## Finding format

```text
[severity] Category and affected boundary — path/file.ts:42

Actor: <who can trigger it>
Prerequisites: <access and state>
Exploit path: <source -> missing control -> sink>
Impact: <data or operation exposed>
Confidence: <why framework or downstream controls do not prevent it>
Correction: <smallest robust boundary-level fix>
```

Keep sensitive proof material out of public comments. When no candidate survives filtering, state that no high-confidence newly introduced vulnerability was found and name the reviewed trust boundaries.
