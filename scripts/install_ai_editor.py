from __future__ import annotations

import argparse
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKILLS = ROOT / "skills"


def write_file(path: Path, content: str, force: bool) -> None:
    if path.exists() and path.read_text() == content:
        return
    if path.exists() and not force:
        raise FileExistsError(f"Refusing to overwrite existing file: {path}")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content)


def copy_skills(destination: Path, force: bool) -> None:
    for source_skill in sorted(SKILLS.iterdir()):
        if not source_skill.is_dir():
            continue
        target_skill = destination / source_skill.name
        for source in sorted(source_skill.rglob("*")):
            if not source.is_file():
                continue
            target = target_skill / source.relative_to(source_skill)
            content = source.read_text()
            write_file(target, content, force)


def cursor_adapter(project: Path, force: bool) -> None:
    copy_skills(project / ".ai" / "skills", force)
    write_file(
        project / ".cursor" / "rules" / "automated-product-engineer.mdc",
        """---
description: Apply the automated product engineering workflow for substantial features, redesigns, and design-to-app work.
globs:
alwaysApply: false
---

Read @.ai/skills/automated-product-engineer/SKILL.md and load only the specialist skills it routes to for the current task.
""",
        force,
    )
    write_file(
        project / ".cursor" / "commands" / "automated-product-engineer.md",
        """Use the workflow in `.ai/skills/automated-product-engineer/SKILL.md` to complete the requested feature from intake through a review-ready draft pull request. Load only relevant specialist skills. Preserve repository instructions and do not merge.
""",
        force,
    )


def windsurf_adapter(project: Path, force: bool) -> None:
    copy_skills(project / ".ai" / "skills", force)
    write_file(
        project / ".windsurf" / "rules" / "automated-product-engineer.md",
        """# Automated Product Engineer

For substantial feature, redesign, or design-to-app work, read `.ai/skills/automated-product-engineer/SKILL.md` and load only the specialist skills it routes to. Preserve repository instructions, produce current QA and screenshot evidence, run retrospective fix-back, and stop at a review-ready draft pull request unless the user explicitly authorizes more.
""",
        force,
    )


def copilot_adapter(project: Path, force: bool) -> None:
    copy_skills(project / ".agents" / "skills", force)
    write_file(
        project / ".github" / "prompts" / "automated-product-engineer.prompt.md",
        """Use the `automated-product-engineer` agent skill to complete the requested feature from intake through a review-ready draft pull request. Load only relevant specialist skills, preserve repository instructions, capture current desktop and mobile evidence, run retrospective fix-back, and do not merge.
""",
        force,
    )


def generic_adapter(project: Path, force: bool) -> None:
    copy_skills(project / ".ai" / "skills", force)
    write_file(
        project / "AI_WORKFLOW.md",
        """# Automated Product Engineer

For substantial feature, redesign, or design-to-app work, begin with `.ai/skills/automated-product-engineer/SKILL.md`. Load only the specialist skills it routes to. Follow the target repository's instructions and preserve human authority over merge and release.
""",
        force,
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Install the public product-engineering skills into another project.")
    parser.add_argument(
        "--target",
        required=True,
        choices=("codex", "claude", "cursor", "windsurf", "copilot", "orca", "generic"),
    )
    parser.add_argument("--project", type=Path, required=True)
    parser.add_argument("--force", action="store_true", help="Replace conflicting adapter or skill files.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    project = args.project.expanduser().resolve()
    if not project.is_dir():
        raise NotADirectoryError(f"Project directory does not exist: {project}")

    if args.target == "codex":
        copy_skills(project / ".agents" / "skills", args.force)
    elif args.target == "claude":
        copy_skills(project / ".claude" / "skills", args.force)
    elif args.target == "cursor":
        cursor_adapter(project, args.force)
    elif args.target == "windsurf":
        windsurf_adapter(project, args.force)
    elif args.target == "copilot":
        copilot_adapter(project, args.force)
    elif args.target == "orca":
        copy_skills(project / ".agents" / "skills", args.force)
        copy_skills(project / ".claude" / "skills", args.force)
    else:
        generic_adapter(project, args.force)

    print(f"Installed {args.target} workflow into {project}")


if __name__ == "__main__":
    main()
