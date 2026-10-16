# Public Skill Audit

This repository includes the reusable engineering workflows from the original private working set after a public-content review.

## Included

- the end-to-end automated product engineer conductor;
- Claude Design and Figma-to-app delivery;
- architecture and full-stack state ownership;
- design-system construction and focused design polish;
- responsive design and manual browser QA;
- local code review, remote pull-request review, security review, and PR packaging.
- twelve focused, copy-ready prompts for design intake, artifact generation, implementation boundaries, verification, and retrospective fix-back.

These files contain reusable methods only. Product names, customer data, internal repository identifiers, private URLs, credentials, environment values, organization-specific analytics schemas, private database instructions, and historical ticket details are excluded.

The concise `SKILL.md` files are routing entry points. Detailed, sanitized operating procedures live in each skill's `references/` directory so supported agents load the extra context only when the active task needs it. The references retain useful failure patterns, review procedures, vertical-slice examples, evidence contracts, and architecture lessons without copying private application facts.

## Deliberately excluded

- company-specific database querying and operational runbooks;
- internal analytics event catalogs and customer data definitions;
- private feature specifications, incident notes, experiments, and ticket histories;
- credentials, test identities, environment URLs, and deployment configuration;
- third-party skill bundles that are available from their original maintainers and are not required for this workflow.

The validation script scans public text and automation files for known private markers. It is a backstop, not a substitute for reviewing every imported document and its Git diff before publishing.
