# Feature Handoff

## Purpose

- Primary user:
- Job to be done:
- Entry points:
- Completion and exit behavior:

## Product decisions

- Final:
- Open:

## State table

| State | Trigger | Visible result | Available actions | Persistence |
| --- | --- | --- | --- | --- |
| Default | Initial eligible visit |  |  |  |
| Loading | Request begins |  |  |  |
| Empty | No records |  |  |  |
| Recoverable error | Request fails |  | Retry, exit |  |
| Success | Final action completes |  |  |  |

## Data contract

- Authoritative data:
- Request and response types:
- Authorization and ownership:
- Idempotency:
- Persistence:
- Cache and refresh behavior:

## Responsive and accessibility behavior

- Desktop:
- Mobile:
- Overflow and wrapping:
- Initial focus and focus return:
- Keyboard, Escape, and outside-click behavior:
- Reduced motion:

## Analytics

| Event | Trigger | Properties |
| --- | --- | --- |
| feature_opened | First visible | source, mode |
| primary_action_clicked | User confirms | option, elapsed_ms |
| feature_completed | Server confirms | result |
| feature_failed | Recoverable failure | error_code, operation |

## Acceptance criteria

- [ ]

## File authority

- Behavior and data:
- Exact copy:
- Tokens:
- Visual references:
- Illustrative code:
