"use client";

import {
  Check,
  Clock3,
  Cloud,
  Database,
  FileText,
  LockKeyhole,
  MessageSquare,
  MousePointer2,
  Pause,
  Play,
  RefreshCw,
  Send,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type CSSProperties, type RefObject } from "react";

export type LiveScenarioId = "points" | "release" | "windows" | "chat" | "document" | "auth";

type WindowKey = "a" | "b";
type CursorState = { id: string; name: string; color: string; x: number; y: number; visible: boolean };
type Message = { id: number; author: string; body: string; mine?: boolean };

type DemoState = {
  cursors: CursorState[];
  activity: string[];
  points: number;
  pointsAmount: string;
  pointEvents: string[];
  selectedRelease: string;
  inspectedRelease: string;
  releaseGates: Record<string, boolean>;
  releaseStatus: string;
  server: { value: string; revision: number };
  windows: Record<WindowKey, { value: string; revision: number }>;
  windowNotice: string;
  messages: Message[];
  chatDraft: string;
  typing: string[];
  unread: number;
  documentText: string;
  documentRevision: number;
  documentNotice: string;
  activeParagraph: string;
  authEmail: string;
  authStage: "signed-out" | "callback" | "verified" | "sleeping" | "refreshing" | "ready";
  authNotice: string;
};

type DemoCommand =
  | { type: "reset" }
  | { type: "cursor"; cursor: CursorState }
  | { type: "activity"; text: string }
  | { type: "points:amount"; value: string }
  | { type: "points:award"; delta: number; author: string }
  | { type: "points:reject"; delta: number; author: string }
  | { type: "release:select"; release: string }
  | { type: "release:inspect"; release: string; stale?: boolean }
  | { type: "release:gate"; gate: string; author: string }
  | { type: "window:edit"; window: WindowKey; value: string }
  | { type: "window:save"; window: WindowKey; author: string }
  | { type: "window:refresh"; window: WindowKey; author: string }
  | { type: "chat:draft"; value: string; author: string }
  | { type: "chat:send"; author: string; mine?: boolean }
  | { type: "chat:receive"; author: string; body: string }
  | { type: "chat:read" }
  | { type: "document:edit"; value: string; author: string }
  | { type: "document:focus"; paragraph: string; author: string }
  | { type: "document:checkpoint"; author: string }
  | { type: "auth:email"; value: string }
  | { type: "auth:stage"; stage: DemoState["authStage"]; notice: string };

type TimelineStep = {
  at: number;
  actor: string;
  note: string;
  cursor?: Omit<CursorState, "visible">;
  commands?: DemoCommand[];
};

const STORY_DURATION = 240_000;
const PLAYBACK_SPEED = 20;
const PLAYBACK_FPS = 30;
const FRAME_DURATION = 1_000 / PLAYBACK_FPS;
const LOOP_DURATION = STORY_DURATION / PLAYBACK_SPEED;
const LOOP_SECONDS = LOOP_DURATION / 1_000;
const defaultDocument = "Release notes\n\nMobile checkout is ready for final review.\n\nSecurity evidence is attached.";

function initialState(): DemoState {
  return {
    cursors: [],
    activity: ["The walkthrough starts when this demo enters the viewport."],
    points: 740,
    pointsAmount: "25",
    pointEvents: ["Server snapshot loaded · 740 points"],
    selectedRelease: "Mobile checkout",
    inspectedRelease: "Mobile checkout",
    releaseGates: { "Design QA": true, "Checkout E2E": true, "Security review": false },
    releaseStatus: "Revision 8 is current.",
    server: { value: "Launch: Oct 27", revision: 12 },
    windows: { a: { value: "Launch: Oct 27", revision: 12 }, b: { value: "Launch: Oct 27", revision: 12 } },
    windowNotice: "Both windows loaded revision 12.",
    messages: [
      { id: 1, author: "Ava", body: "Checkout evidence is ready." },
      { id: 2, author: "Luis", body: "I’ll verify the retry path." },
    ],
    chatDraft: "",
    typing: [],
    unread: 2,
    documentText: defaultDocument,
    documentRevision: 18,
    documentNotice: "Revision 18 synced. Two collaborators online.",
    activeParagraph: "Mobile checkout is ready for final review.",
    authEmail: "",
    authStage: "signed-out",
    authNotice: "No session cookie is present.",
  };
}

function addActivity(state: DemoState, text: string) {
  return { ...state, activity: [text, ...state.activity].slice(0, 4) };
}

function reducer(state: DemoState, command: DemoCommand): DemoState {
  switch (command.type) {
    case "reset":
      return initialState();
    case "cursor": {
      const next = state.cursors.filter((cursor) => cursor.id !== command.cursor.id);
      return { ...state, cursors: [...next, command.cursor] };
    }
    case "activity":
      return addActivity(state, command.text);
    case "points:amount":
      return { ...state, pointsAmount: command.value };
    case "points:award":
      return addActivity({ ...state, points: state.points + command.delta, pointEvents: [`${command.author} awarded ${command.delta} · canonical`, ...state.pointEvents].slice(0, 3) }, `${command.author} updated the shared account cache.`);
    case "points:reject":
      return addActivity({ ...state, pointEvents: [`${command.author} tried +${command.delta} · rolled back`, ...state.pointEvents].slice(0, 3) }, `The server rejected ${command.author}’s duplicate award; every surface rolled back.`);
    case "release:select":
      return { ...state, selectedRelease: command.release, releaseStatus: `Loading ${command.release}…` };
    case "release:inspect":
      return addActivity({ ...state, inspectedRelease: command.release, releaseStatus: command.stale ? `Late response painted ${command.release}. The mismatch is now visible.` : `${command.release} reconciled from its keyed query.` }, command.stale ? "A stale response arrived after the selection changed." : "The current query response won; obsolete work was ignored.");
    case "release:gate": {
      const enabled = !state.releaseGates[command.gate];
      return addActivity({ ...state, releaseGates: { ...state.releaseGates, [command.gate]: enabled } }, `${command.author} ${enabled ? "completed" : "reopened"} ${command.gate}.`);
    }
    case "window:edit":
      return { ...state, windows: { ...state.windows, [command.window]: { ...state.windows[command.window], value: command.value } } };
    case "window:save": {
      const draft = state.windows[command.window];
      if (draft.revision !== state.server.revision) {
        return addActivity({ ...state, windowNotice: `Window ${command.window.toUpperCase()} received 409 at revision ${draft.revision}.` }, `${command.author} hit a stale-write conflict; the newer value stayed safe.`);
      }
      const saved = { value: draft.value, revision: state.server.revision + 1 };
      return addActivity({ ...state, server: saved, windows: { ...state.windows, [command.window]: saved }, windowNotice: `Window ${command.window.toUpperCase()} saved revision ${saved.revision}. Sibling tabs were invalidated.` }, `${command.author} wrote revision ${saved.revision}.`);
    }
    case "window:refresh":
      return addActivity({ ...state, windows: { ...state.windows, [command.window]: state.server }, windowNotice: `Window ${command.window.toUpperCase()} refreshed to revision ${state.server.revision}.` }, `${command.author} reconciled the stale window before editing again.`);
    case "chat:draft": {
      const typing = command.value ? Array.from(new Set([...state.typing, command.author])) : state.typing.filter((name) => name !== command.author);
      return { ...state, chatDraft: command.value, typing };
    }
    case "chat:send": {
      if (!state.chatDraft.trim()) return state;
      const message = { id: Date.now(), author: command.author, body: state.chatDraft.trim(), mine: command.mine };
      return addActivity({ ...state, messages: [...state.messages, message].slice(-5), chatDraft: "", typing: state.typing.filter((name) => name !== command.author) }, `${command.author} sent a persisted message; the optimistic row reconciled by nonce.`);
    }
    case "chat:receive":
      return addActivity({ ...state, messages: [...state.messages, { id: Date.now(), author: command.author, body: command.body }].slice(-5), unread: state.unread + 1, typing: state.typing.filter((name) => name !== command.author) }, `${command.author}’s server message updated the conversation and global unread count.`);
    case "chat:read":
      return addActivity({ ...state, unread: 0 }, "You marked the canonical thread read; the inbox badge reconciled.");
    case "document:edit":
      return addActivity({ ...state, documentText: command.value, documentNotice: `${command.author} has an uncheckpointed local operation.` }, `${command.author} edited through the same operation dispatcher.`);
    case "document:focus":
      return { ...state, activeParagraph: command.paragraph, documentNotice: `${command.author} is editing “${command.paragraph}”` };
    case "document:checkpoint":
      return addActivity({ ...state, documentRevision: state.documentRevision + 1, documentNotice: `${command.author} checkpointed revision ${state.documentRevision + 1}.` }, `Revision ${state.documentRevision + 1} became durable; cursor presence stayed ephemeral.`);
    case "auth:email":
      return { ...state, authEmail: command.value };
    case "auth:stage":
      return addActivity({ ...state, authStage: command.stage, authNotice: command.notice }, command.notice);
  }
}

const actorColors: Record<string, string> = { Maya: "#a991ff", Noah: "#72e2c0", Ava: "#7bb7ff", Luis: "#f2bf68", You: "#ff887f" };

const timelineBlueprints: Record<LiveScenarioId, TimelineStep[]> = {
  points: [
    { at: 800, actor: "Maya", note: "Maya opens Rewards.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 28, y: 38 } },
    { at: 7_000, actor: "Maya", note: "Maya changes the award amount.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 71, y: 35 }, commands: [{ type: "points:amount", value: "40" }] },
    { at: 13_000, actor: "Maya", note: "Maya awards 40 points.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 78, y: 53 }, commands: [{ type: "points:award", delta: 40, author: "Maya" }] },
    { at: 21_000, actor: "Noah", note: "Noah sees the new total in checkout.", cursor: { id: "noah", name: "Noah", color: actorColors.Noah, x: 36, y: 23 } },
    { at: 29_000, actor: "Noah", note: "Noah tries the same award again.", cursor: { id: "noah", name: "Noah", color: actorColors.Noah, x: 78, y: 53 }, commands: [{ type: "points:reject", delta: 40, author: "Noah" }] },
    { at: 38_000, actor: "Maya", note: "Maya awards a smaller bonus.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 70, y: 35 }, commands: [{ type: "points:amount", value: "15" }] },
    { at: 45_000, actor: "Maya", note: "The shared cache updates every observer.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 78, y: 53 }, commands: [{ type: "points:award", delta: 15, author: "Maya" }] },
    { at: 56_000, actor: "Noah", note: "Noah verifies the account header.", cursor: { id: "noah", name: "Noah", color: actorColors.Noah, x: 87, y: 15 } },
    { at: 62_000, actor: "Maya", note: "Maya opens the canonical account history.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 23, y: 72 } },
  ],
  release: [
    { at: 800, actor: "Maya", note: "Maya selects Mobile checkout.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 20, y: 35 }, commands: [{ type: "release:select", release: "Mobile checkout" }] },
    { at: 7_000, actor: "Maya", note: "Request A begins for revision 8.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 56, y: 29 } },
    { at: 13_000, actor: "Maya", note: "Maya quickly selects Team permissions.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 20, y: 58 }, commands: [{ type: "release:select", release: "Team permissions" }] },
    { at: 20_000, actor: "Noah", note: "Noah completes Security review.", cursor: { id: "noah", name: "Noah", color: actorColors.Noah, x: 74, y: 54 }, commands: [{ type: "release:gate", gate: "Security review", author: "Noah" }] },
    { at: 28_000, actor: "Server", note: "Request B paints revision 14.", commands: [{ type: "release:inspect", release: "Team permissions" }] },
    { at: 36_000, actor: "Server", note: "The broken request A paints late.", commands: [{ type: "release:inspect", release: "Mobile checkout", stale: true }] },
    { at: 44_000, actor: "Maya", note: "Maya reruns with a keyed, cancellable query.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 20, y: 58 }, commands: [{ type: "release:select", release: "Team permissions" }] },
    { at: 52_000, actor: "Server", note: "Only the current response reconciles.", commands: [{ type: "release:inspect", release: "Team permissions" }] },
    { at: 61_000, actor: "Noah", note: "Noah verifies the current inspector.", cursor: { id: "noah", name: "Noah", color: actorColors.Noah, x: 72, y: 31 } },
  ],
  windows: [
    { at: 800, actor: "Maya", note: "Maya starts in Window A.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 25, y: 42 } },
    { at: 7_000, actor: "Maya", note: "Maya types a new launch date.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 24, y: 55 }, commands: [{ type: "window:edit", window: "a", value: "Launch: Nov 1" }] },
    { at: 14_000, actor: "Noah", note: "Noah edits the stale copy in Window B.", cursor: { id: "noah", name: "Noah", color: actorColors.Noah, x: 72, y: 55 }, commands: [{ type: "window:edit", window: "b", value: "Launch: Nov 3" }] },
    { at: 22_000, actor: "Maya", note: "Maya saves expected revision 12.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 24, y: 72 }, commands: [{ type: "window:save", window: "a", author: "Maya" }] },
    { at: 31_000, actor: "Noah", note: "Noah’s stale revision is rejected.", cursor: { id: "noah", name: "Noah", color: actorColors.Noah, x: 72, y: 72 }, commands: [{ type: "window:save", window: "b", author: "Noah" }] },
    { at: 40_000, actor: "Noah", note: "Noah refreshes before retrying.", cursor: { id: "noah", name: "Noah", color: actorColors.Noah, x: 84, y: 72 }, commands: [{ type: "window:refresh", window: "b", author: "Noah" }] },
    { at: 48_000, actor: "Noah", note: "Noah applies an intentional edit.", cursor: { id: "noah", name: "Noah", color: actorColors.Noah, x: 72, y: 55 }, commands: [{ type: "window:edit", window: "b", value: "Launch: Nov 2" }] },
    { at: 56_000, actor: "Noah", note: "Noah saves against revision 13.", cursor: { id: "noah", name: "Noah", color: actorColors.Noah, x: 72, y: 72 }, commands: [{ type: "window:save", window: "b", author: "Noah" }] },
    { at: 62_000, actor: "Maya", note: "Both users now see revision 14.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 50, y: 16 } },
  ],
  chat: [
    { at: 800, actor: "Ava", note: "Ava opens the support thread.", cursor: { id: "ava", name: "Ava", color: actorColors.Ava, x: 32, y: 32 }, commands: [{ type: "chat:read" }] },
    { at: 7_000, actor: "Luis", note: "Luis begins typing.", cursor: { id: "luis", name: "Luis", color: actorColors.Luis, x: 62, y: 76 }, commands: [{ type: "chat:draft", value: "Retry", author: "Luis" }] },
    { at: 12_000, actor: "Luis", note: "Luis continues the same local draft.", cursor: { id: "luis", name: "Luis", color: actorColors.Luis, x: 70, y: 76 }, commands: [{ type: "chat:draft", value: "Retry passed", author: "Luis" }] },
    { at: 18_000, actor: "Luis", note: "Luis sends the durable message.", cursor: { id: "luis", name: "Luis", color: actorColors.Luis, x: 87, y: 76 }, commands: [{ type: "chat:send", author: "Luis" }] },
    { at: 28_000, actor: "You", note: "You begin a reply from the first-person view.", cursor: { id: "you", name: "You", color: actorColors.You, x: 55, y: 76 }, commands: [{ type: "chat:draft", value: "I’m checking", author: "You" }] },
    { at: 34_000, actor: "You", note: "Your local draft stays private while you type.", cursor: { id: "you", name: "You", color: actorColors.You, x: 67, y: 76 }, commands: [{ type: "chat:draft", value: "I’m checking the retry before we ship.", author: "You" }] },
    { at: 41_000, actor: "You", note: "You send; every subscriber reconciles.", cursor: { id: "you", name: "You", color: actorColors.You, x: 87, y: 76 }, commands: [{ type: "chat:send", author: "You", mine: true }] },
    { at: 51_000, actor: "Maya", note: "Maya messages from another page.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 18, y: 22 }, commands: [{ type: "chat:receive", author: "Maya", body: "Security evidence attached." }] },
    { at: 61_000, actor: "Ava", note: "Ava clears the global unread badge.", cursor: { id: "ava", name: "Ava", color: actorColors.Ava, x: 87, y: 16 }, commands: [{ type: "chat:read" }] },
  ],
  document: [
    { at: 800, actor: "Ava", note: "Ava opens the release paragraph.", cursor: { id: "ava", name: "Ava", color: actorColors.Ava, x: 31, y: 46 }, commands: [{ type: "document:focus", paragraph: "Mobile checkout is ready for final review.", author: "Ava" }] },
    { at: 8_000, actor: "Ava", note: "Ava edits locally.", cursor: { id: "ava", name: "Ava", color: actorColors.Ava, x: 42, y: 48 }, commands: [{ type: "document:edit", value: "Release notes\n\nMobile checkout is ready for launch review.\n\nSecurity evidence is attached.", author: "Ava" }] },
    { at: 16_000, actor: "Luis", note: "Luis opens the security paragraph.", cursor: { id: "luis", name: "Luis", color: actorColors.Luis, x: 38, y: 62 }, commands: [{ type: "document:focus", paragraph: "Security evidence is attached.", author: "Luis" }] },
    { at: 24_000, actor: "Luis", note: "Luis adds an independent operation.", cursor: { id: "luis", name: "Luis", color: actorColors.Luis, x: 48, y: 64 }, commands: [{ type: "document:edit", value: "Release notes\n\nMobile checkout is ready for launch review.\n\nSecurity evidence and retry logs are attached.", author: "Luis" }] },
    { at: 34_000, actor: "Ava", note: "Ava checkpoints the merged operations.", cursor: { id: "ava", name: "Ava", color: actorColors.Ava, x: 82, y: 20 }, commands: [{ type: "document:checkpoint", author: "Ava" }] },
    { at: 43_000, actor: "Luis", note: "Luis continues after the checkpoint.", cursor: { id: "luis", name: "Luis", color: actorColors.Luis, x: 44, y: 64 }, commands: [{ type: "document:edit", value: "Release notes\n\nMobile checkout is ready for launch review.\n\nSecurity evidence, retry logs, and owner sign-off are attached.", author: "Luis" }] },
    { at: 52_000, actor: "Luis", note: "Luis creates revision 20.", cursor: { id: "luis", name: "Luis", color: actorColors.Luis, x: 82, y: 20 }, commands: [{ type: "document:checkpoint", author: "Luis" }] },
    { at: 61_000, actor: "Ava", note: "Presence moves independently of saved content.", cursor: { id: "ava", name: "Ava", color: actorColors.Ava, x: 31, y: 46 } },
  ],
  auth: [
    { at: 800, actor: "Maya", note: "Maya opens the sign-in form.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 27, y: 45 } },
    { at: 6_000, actor: "Maya", note: "Maya types her email.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 37, y: 52 }, commands: [{ type: "auth:email", value: "maya@acme.test" }] },
    { at: 13_000, actor: "Maya", note: "Maya starts the PKCE exchange.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 29, y: 67 }, commands: [{ type: "auth:stage", stage: "callback", notice: "Callback exchanges the code before navigation." }] },
    { at: 21_000, actor: "Server", note: "The server verifies claims.", cursor: { id: "server", name: "Server", color: actorColors.Noah, x: 57, y: 43 }, commands: [{ type: "auth:stage", stage: "verified", notice: "Claims verified; domain authorization can run." }] },
    { at: 29_000, actor: "Maya", note: "Maya’s tab sleeps.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 27, y: 30 }, commands: [{ type: "auth:stage", stage: "sleeping", notice: "Access token expired while the tab slept; refresh cookie remains." }] },
    { at: 38_000, actor: "Server", note: "One request rotates the refresh token.", cursor: { id: "server", name: "Server", color: actorColors.Noah, x: 57, y: 57 }, commands: [{ type: "auth:stage", stage: "refreshing", notice: "A single server request refreshes and writes Set-Cookie." }] },
    { at: 47_000, actor: "Database", note: "RLS evaluates the verified user token.", cursor: { id: "database", name: "RLS", color: actorColors.Luis, x: 82, y: 55 }, commands: [{ type: "auth:stage", stage: "ready", notice: "Session restored without a logout; RLS returns Maya’s workspace rows." }] },
    { at: 57_000, actor: "Maya", note: "Maya continues on the protected page.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 72, y: 72 } },
    { at: 62_000, actor: "Server", note: "The server records a healthy refresh trace.", cursor: { id: "server", name: "Server", color: actorColors.Noah, x: 57, y: 43 } },
  ],
};

const timelineContinuations: Record<LiveScenarioId, TimelineStep[]> = {
  points: [
    { at: 76_000, actor: "Noah", note: "Noah starts a ten-point service recovery credit.", cursor: { id: "noah", name: "Noah", color: actorColors.Noah, x: 70, y: 35 }, commands: [{ type: "points:amount", value: "10" }] },
    { at: 89_000, actor: "Noah", note: "The credit paints optimistically in both surfaces.", cursor: { id: "noah", name: "Noah", color: actorColors.Noah, x: 78, y: 53 }, commands: [{ type: "points:award", delta: 10, author: "Noah" }] },
    { at: 105_000, actor: "Maya", note: "Maya verifies the updated balance in Rewards.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 34, y: 28 } },
    { at: 121_000, actor: "Maya", note: "Maya prepares a larger loyalty adjustment.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 70, y: 35 }, commands: [{ type: "points:amount", value: "50" }] },
    { at: 136_000, actor: "Maya", note: "The fifty-point adjustment becomes canonical.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 78, y: 53 }, commands: [{ type: "points:award", delta: 50, author: "Maya" }] },
    { at: 153_000, actor: "Noah", note: "Noah retries the captured request after reconnecting.", cursor: { id: "noah", name: "Noah", color: actorColors.Noah, x: 78, y: 53 }, commands: [{ type: "points:reject", delta: 50, author: "Noah" }] },
    { at: 171_000, actor: "Maya", note: "Maya switches the draft to a five-point courtesy bonus.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 70, y: 35 }, commands: [{ type: "points:amount", value: "5" }] },
    { at: 187_000, actor: "Maya", note: "The smaller bonus updates every active observer.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 78, y: 53 }, commands: [{ type: "points:award", delta: 5, author: "Maya" }] },
    { at: 207_000, actor: "Noah", note: "Noah confirms checkout and the account header agree.", cursor: { id: "noah", name: "Noah", color: actorColors.Noah, x: 87, y: 15 } },
    { at: 229_000, actor: "Maya", note: "The account closes with one canonical balance and an auditable event trail.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 36, y: 64 } },
  ],
  release: [
    { at: 75_000, actor: "Maya", note: "Maya opens Weekly digest without reusing the prior request.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 20, y: 79 }, commands: [{ type: "release:select", release: "Weekly digest" }] },
    { at: 89_000, actor: "Server", note: "The keyed query returns Weekly digest revision 3.", commands: [{ type: "release:inspect", release: "Weekly digest" }] },
    { at: 104_000, actor: "Noah", note: "Noah reopens Checkout E2E after finding a retry defect.", cursor: { id: "noah", name: "Noah", color: actorColors.Noah, x: 59, y: 54 }, commands: [{ type: "release:gate", gate: "Checkout E2E", author: "Noah" }] },
    { at: 121_000, actor: "Maya", note: "Maya returns to Mobile checkout while the fix runs.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 20, y: 35 }, commands: [{ type: "release:select", release: "Mobile checkout" }] },
    { at: 136_000, actor: "Server", note: "Mobile checkout revision 8 reconciles against its own key.", commands: [{ type: "release:inspect", release: "Mobile checkout" }] },
    { at: 153_000, actor: "Noah", note: "Noah completes the repaired Checkout E2E gate.", cursor: { id: "noah", name: "Noah", color: actorColors.Noah, x: 59, y: 54 }, commands: [{ type: "release:gate", gate: "Checkout E2E", author: "Noah" }] },
    { at: 171_000, actor: "Maya", note: "Maya confirms Security review remains complete.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 74, y: 54 } },
    { at: 190_000, actor: "Maya", note: "The inspector stays aligned while Maya compares all three releases.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 56, y: 29 } },
    { at: 211_000, actor: "Noah", note: "Noah verifies there is no late response left to paint.", cursor: { id: "noah", name: "Noah", color: actorColors.Noah, x: 72, y: 31 } },
    { at: 230_000, actor: "Server", note: "Cancellation, query keys, and canonical reconciliation leave the correct release selected." },
  ],
  windows: [
    { at: 76_000, actor: "Maya", note: "Maya changes the launch owner in Window A.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 24, y: 55 }, commands: [{ type: "window:edit", window: "a", value: "Owner: Maya · Nov 2" }] },
    { at: 91_000, actor: "Maya", note: "Window A saves the owner at the current revision.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 24, y: 72 }, commands: [{ type: "window:save", window: "a", author: "Maya" }] },
    { at: 108_000, actor: "Noah", note: "Window B still carries the prior snapshot.", cursor: { id: "noah", name: "Noah", color: actorColors.Noah, x: 72, y: 55 }, commands: [{ type: "window:edit", window: "b", value: "Owner: Noah · Nov 4" }] },
    { at: 124_000, actor: "Noah", note: "Noah sees a second explicit stale-write conflict.", cursor: { id: "noah", name: "Noah", color: actorColors.Noah, x: 72, y: 72 }, commands: [{ type: "window:save", window: "b", author: "Noah" }] },
    { at: 142_000, actor: "Noah", note: "Noah refreshes and keeps the server-owned value safe.", cursor: { id: "noah", name: "Noah", color: actorColors.Noah, x: 84, y: 72 }, commands: [{ type: "window:refresh", window: "b", author: "Noah" }] },
    { at: 160_000, actor: "Noah", note: "Noah now makes an intentional post-refresh edit.", cursor: { id: "noah", name: "Noah", color: actorColors.Noah, x: 72, y: 55 }, commands: [{ type: "window:edit", window: "b", value: "Owner: Noah · Nov 3" }] },
    { at: 178_000, actor: "Noah", note: "The revised edit saves without overwriting Maya silently.", cursor: { id: "noah", name: "Noah", color: actorColors.Noah, x: 72, y: 72 }, commands: [{ type: "window:save", window: "b", author: "Noah" }] },
    { at: 198_000, actor: "Maya", note: "Maya refreshes Window A after the sibling-tab invalidation.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 36, y: 72 }, commands: [{ type: "window:refresh", window: "a", author: "Maya" }] },
    { at: 217_000, actor: "Noah", note: "Both windows now display the same value and revision.", cursor: { id: "noah", name: "Noah", color: actorColors.Noah, x: 50, y: 16 } },
    { at: 232_000, actor: "Maya", note: "The audit trail shows two conflicts resolved without lost work.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 50, y: 84 } },
  ],
  chat: [
    { at: 74_000, actor: "You", note: "You reopen the thread and review Maya’s evidence.", cursor: { id: "you", name: "You", color: actorColors.You, x: 46, y: 43 } },
    { at: 88_000, actor: "Ava", note: "Ava begins a follow-up while you stay in the conversation.", cursor: { id: "ava", name: "Ava", color: actorColors.Ava, x: 61, y: 76 }, commands: [{ type: "chat:draft", value: "Can we ship", author: "Ava" }] },
    { at: 102_000, actor: "Ava", note: "Ava finishes the question before sending.", cursor: { id: "ava", name: "Ava", color: actorColors.Ava, x: 72, y: 76 }, commands: [{ type: "chat:draft", value: "Can we ship after the retry check?", author: "Ava" }] },
    { at: 116_000, actor: "Ava", note: "Ava’s optimistic message reconciles by client nonce.", cursor: { id: "ava", name: "Ava", color: actorColors.Ava, x: 87, y: 76 }, commands: [{ type: "chat:send", author: "Ava" }] },
    { at: 133_000, actor: "You", note: "You type a first-person decision with your own cursor.", cursor: { id: "you", name: "You", color: actorColors.You, x: 61, y: 76 }, commands: [{ type: "chat:draft", value: "Yes — retry is green", author: "You" }] },
    { at: 148_000, actor: "You", note: "You add the remaining release condition.", cursor: { id: "you", name: "You", color: actorColors.You, x: 72, y: 76 }, commands: [{ type: "chat:draft", value: "Yes — retry is green. Waiting on owner sign-off.", author: "You" }] },
    { at: 163_000, actor: "You", note: "You send the decision from the first-person view.", cursor: { id: "you", name: "You", color: actorColors.You, x: 87, y: 76 }, commands: [{ type: "chat:send", author: "You", mine: true }] },
    { at: 181_000, actor: "Luis", note: "Luis confirms owner sign-off from another surface.", cursor: { id: "luis", name: "Luis", color: actorColors.Luis, x: 18, y: 22 }, commands: [{ type: "chat:receive", author: "Luis", body: "Owner sign-off is recorded." }] },
    { at: 202_000, actor: "You", note: "You mark the thread read after the server acknowledgment.", cursor: { id: "you", name: "You", color: actorColors.You, x: 87, y: 16 }, commands: [{ type: "chat:read" }] },
    { at: 229_000, actor: "Ava", note: "The thread ends durable, ordered, and caught up for every participant.", cursor: { id: "ava", name: "Ava", color: actorColors.Ava, x: 42, y: 47 } },
  ],
  document: [
    { at: 75_000, actor: "Ava", note: "Ava opens the release title for a second editing pass.", cursor: { id: "ava", name: "Ava", color: actorColors.Ava, x: 31, y: 35 }, commands: [{ type: "document:focus", paragraph: "Release notes", author: "Ava" }] },
    { at: 91_000, actor: "Ava", note: "Ava adds the rollout cohort to the shared brief.", cursor: { id: "ava", name: "Ava", color: actorColors.Ava, x: 45, y: 48 }, commands: [{ type: "document:edit", value: "Release notes · Cohort A\n\nMobile checkout is ready for launch review.\n\nSecurity evidence, retry logs, and owner sign-off are attached.", author: "Ava" }] },
    { at: 108_000, actor: "Luis", note: "Luis moves to the checkout paragraph without stealing focus.", cursor: { id: "luis", name: "Luis", color: actorColors.Luis, x: 38, y: 52 }, commands: [{ type: "document:focus", paragraph: "Mobile checkout", author: "Luis" }] },
    { at: 124_000, actor: "Luis", note: "Luis records the verified retry behavior as a separate operation.", cursor: { id: "luis", name: "Luis", color: actorColors.Luis, x: 52, y: 54 }, commands: [{ type: "document:edit", value: "Release notes · Cohort A\n\nMobile checkout and retry recovery are ready for launch review.\n\nSecurity evidence, retry logs, and owner sign-off are attached.", author: "Luis" }] },
    { at: 142_000, actor: "Ava", note: "Ava checkpoints both merged operations as revision 21.", cursor: { id: "ava", name: "Ava", color: actorColors.Ava, x: 82, y: 20 }, commands: [{ type: "document:checkpoint", author: "Ava" }] },
    { at: 160_000, actor: "Luis", note: "Luis adds the final analytics note after the checkpoint.", cursor: { id: "luis", name: "Luis", color: actorColors.Luis, x: 48, y: 68 }, commands: [{ type: "document:edit", value: "Release notes · Cohort A\n\nMobile checkout and retry recovery are ready for launch review.\n\nSecurity evidence, retry logs, owner sign-off, and analytics are attached.", author: "Luis" }] },
    { at: 179_000, actor: "Ava", note: "Ava reviews Luis’s remote caret and the unsaved operation.", cursor: { id: "ava", name: "Ava", color: actorColors.Ava, x: 58, y: 68 } },
    { at: 198_000, actor: "Luis", note: "Luis checkpoints the completed brief as revision 22.", cursor: { id: "luis", name: "Luis", color: actorColors.Luis, x: 82, y: 20 }, commands: [{ type: "document:checkpoint", author: "Luis" }] },
    { at: 217_000, actor: "Ava", note: "Ava confirms content is durable while cursor presence remains ephemeral.", cursor: { id: "ava", name: "Ava", color: actorColors.Ava, x: 31, y: 46 } },
    { at: 231_000, actor: "Luis", note: "Both collaborators leave one merged document and a clear revision history.", cursor: { id: "luis", name: "Luis", color: actorColors.Luis, x: 18, y: 22 } },
  ],
  auth: [
    { at: 75_000, actor: "Maya", note: "Maya opens a second protected view using the shared cookie session.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 72, y: 31 } },
    { at: 91_000, actor: "Database", note: "RLS scopes the second query to Maya’s workspace.", cursor: { id: "database", name: "RLS", color: actorColors.Luis, x: 82, y: 55 }, commands: [{ type: "auth:stage", stage: "ready", notice: "A second protected query reused the verified session and tenant policy." }] },
    { at: 109_000, actor: "Maya", note: "The background tab sleeps through another access-token expiry.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 27, y: 30 }, commands: [{ type: "auth:stage", stage: "sleeping", notice: "The background tab expired again while the refresh cookie remained valid." }] },
    { at: 126_000, actor: "Server", note: "Two loaders request a refresh at nearly the same time.", cursor: { id: "server", name: "Server", color: actorColors.Noah, x: 57, y: 49 }, commands: [{ type: "auth:stage", stage: "refreshing", notice: "Concurrent loaders joined one refresh instead of rotating the token twice." }] },
    { at: 145_000, actor: "Server", note: "One Set-Cookie response persists the rotated token.", cursor: { id: "server", name: "Server", color: actorColors.Noah, x: 64, y: 57 } },
    { at: 163_000, actor: "Maya", note: "Maya resumes without a redirect or random logout.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 72, y: 72 }, commands: [{ type: "auth:stage", stage: "ready", notice: "The refreshed cookie restored both loaders without a sign-in redirect." }] },
    { at: 182_000, actor: "Database", note: "RLS rejects an unrelated tenant row while the session stays healthy.", cursor: { id: "database", name: "RLS", color: actorColors.Luis, x: 82, y: 55 } },
    { at: 201_000, actor: "Server", note: "The trace separates authentication, domain authorization, and data policy.", cursor: { id: "server", name: "Server", color: actorColors.Noah, x: 57, y: 43 } },
    { at: 219_000, actor: "Maya", note: "Maya continues working across both protected surfaces.", cursor: { id: "maya", name: "Maya", color: actorColors.Maya, x: 72, y: 72 } },
    { at: 232_000, actor: "Server", note: "The session closes healthy with one refresh owner and an auditable cookie path.", cursor: { id: "server", name: "Server", color: actorColors.Noah, x: 57, y: 43 } },
  ],
};

const timelines = Object.fromEntries(
  Object.entries(timelineBlueprints).map(([scenarioId, steps]) => [
    scenarioId,
    [...steps, ...timelineContinuations[scenarioId as LiveScenarioId]]
      .sort((a, b) => a.at - b.at)
      .map((step) => ({ ...step, at: step.at / PLAYBACK_SPEED })),
  ]),
) as Record<LiveScenarioId, TimelineStep[]>;

function cursorsAtTime(steps: TimelineStep[], elapsed: number): CursorState[] {
  const tracks = new Map<string, Array<{ at: number; cursor: Omit<CursorState, "visible"> }>>();
  steps.forEach((step) => {
    if (!step.cursor) return;
    const track = tracks.get(step.cursor.id) ?? [];
    track.push({ at: step.at, cursor: step.cursor });
    tracks.set(step.cursor.id, track);
  });

  return Array.from(tracks.values()).flatMap((track) => {
    const previousIndex = track.findLastIndex((point) => point.at <= elapsed);
    if (previousIndex < 0) return [];
    const previous = track[previousIndex];
    const following = track[previousIndex + 1];
    if (!following) return [{ ...previous.cursor, visible: true }];
    const rawProgress = Math.min(1, Math.max(0, (elapsed - previous.at) / (following.at - previous.at)));
    const progress = rawProgress * rawProgress * (3 - 2 * rawProgress);
    return [{
      ...previous.cursor,
      x: previous.cursor.x + (following.cursor.x - previous.cursor.x) * progress,
      y: previous.cursor.y + (following.cursor.y - previous.cursor.y) * progress,
      visible: true,
    }];
  });
}

function useLivePlayback(scenarioId: LiveScenarioId, surfaceRef: RefObject<HTMLDivElement | null>) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [inView, setInView] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);
  const appliedRef = useRef(new Set<number>());
  const startedAtRef = useRef(0);
  const steps = timelines[scenarioId];

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
    elapsedRef.current = 0;
    setElapsed(0);
    appliedRef.current.clear();
    startedAtRef.current = performance.now();
  }, []);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.28 });
    observer.observe(surface);
    return () => observer.disconnect();
  }, [surfaceRef]);

  useEffect(() => {
    if (!inView || !enabled) return;
    startedAtRef.current = performance.now() - elapsedRef.current;
    let animationFrame = 0;
    let lastFrame = -FRAME_DURATION;
    const tick = (now: number) => {
      if (now - lastFrame < FRAME_DURATION) {
        animationFrame = window.requestAnimationFrame(tick);
        return;
      }
      lastFrame = now - ((now - lastFrame) % FRAME_DURATION);
      let next = now - startedAtRef.current;
      if (next >= LOOP_DURATION) {
        dispatch({ type: "reset" });
        appliedRef.current.clear();
        startedAtRef.current = now;
        next = 0;
      }
      elapsedRef.current = next;
      setElapsed(next);
      cursorsAtTime(steps, next).forEach((cursor) => dispatch({ type: "cursor", cursor }));
      steps.forEach((step, index) => {
        if (step.at > next || appliedRef.current.has(index)) return;
        appliedRef.current.add(index);
        step.commands?.forEach((command) => dispatch(command));
        dispatch({ type: "activity", text: step.note });
      });
      animationFrame = window.requestAnimationFrame(tick);
    };
    animationFrame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [enabled, inView, steps]);

  const human = useCallback((commands: DemoCommand[], note: string) => {
    setEnabled(false);
    commands.forEach((command) => dispatch(command));
    dispatch({ type: "activity", text: `You took control · ${note}` });
  }, []);

  return { state, human, elapsed, inView, enabled, setEnabled, reset };
}

function CursorLayer({ cursors }: { cursors: CursorState[] }) {
  return <div className="live-cursor-layer" aria-hidden="true">{cursors.filter((cursor) => cursor.visible).map((cursor) => <div className="live-cursor" key={cursor.id} style={{ left: `${cursor.x}%`, top: `${cursor.y}%`, "--cursor-color": cursor.color } as CSSProperties}><MousePointer2 size={22} fill="currentColor" /><span>{cursor.name}</span></div>)}</div>;
}

function PlaybackChrome({ title, actors, elapsed, playing, inView, onToggle, onReset }: { title: string; actors: string[]; elapsed: number; playing: boolean; inView: boolean; onToggle: () => void; onReset: () => void }) {
  return <header className="live-demo-header"><div><span>LIVE USAGE · 4 MINUTE STORY · 20× PLAYBACK · 30 FPS</span><h5>{title}</h5><div className="live-presence"><UsersRound size={13} />{actors.map((actor) => <strong key={actor}><i style={{ background: actorColors[actor] ?? "#a991ff" }} />{actor}</strong>)}</div></div><div className="playback-controls"><span>{inView ? `${(elapsed / 1_000).toFixed(1)}s / ${LOOP_SECONDS.toFixed(1)}s` : "Scroll into view to start"}</span><button type="button" onClick={onToggle}>{playing ? <Pause size={13} /> : <Play size={13} />}{playing ? "Pause" : "Play"}</button><button type="button" onClick={onReset}><RefreshCw size={13} /> Replay</button></div><div className="playback-progress"><span style={{ width: `${Math.min(100, elapsed / LOOP_DURATION * 100)}%` }} /></div></header>;
}

function PointsDemo({ state, human }: { state: DemoState; human: (commands: DemoCommand[], note: string) => void }) {
  const amount = Math.max(1, Number(state.pointsAmount) || 1);
  return <div className="living-app points-app"><div className="living-topbar"><span><Sparkles size={14} /> Acme Rewards</span><strong>{state.points} pts</strong></div><div className="living-main"><section><small>REWARDS</small><h6>{state.points}</h6><p>Available points</p><div className="points-history">{state.pointEvents.map((event) => <span key={event}>{event}</span>)}</div></section><aside><label htmlFor="live-points-amount">Award amount</label><input id="live-points-amount" inputMode="numeric" value={state.pointsAmount} onChange={(event) => human([{ type: "points:amount", value: event.target.value }], `changed the draft award to ${event.target.value || "0"}.`)} /><button type="button" onClick={() => human([{ type: "points:award", delta: amount, author: "You" }], `awarded ${amount} points.`)}>Award points</button><button type="button" className="quiet" onClick={() => human([{ type: "points:reject", delta: amount, author: "You" }], "tested a rejected duplicate.")}>Test rollback</button></aside></div></div>;
}

const releaseNames = ["Mobile checkout", "Team permissions", "Weekly digest"];
function ReleaseDemo({ state, human }: { state: DemoState; human: (commands: DemoCommand[], note: string) => void }) {
  const inspect = (release: string) => {
    human([{ type: "release:select", release }], `selected ${release}.`);
    window.setTimeout(() => human([{ type: "release:inspect", release }], `loaded ${release} from its keyed query.`), 360);
  };
  return <div className="living-app release-app"><nav>{releaseNames.map((release) => <button type="button" className={state.selectedRelease === release ? "active" : ""} key={release} onClick={() => inspect(release)}><span>{release}</span><small>{release === "Team permissions" ? "rev 14" : release === "Weekly digest" ? "rev 3" : "rev 8"}</small></button>)}</nav><section><div className="release-demo-heading"><div><small>CURRENT SELECTION</small><h6>{state.selectedRelease}</h6></div><div><small>INSPECTOR DATA</small><strong className={state.selectedRelease !== state.inspectedRelease ? "mismatch" : ""}>{state.inspectedRelease}</strong></div></div><p className="release-status">{state.releaseStatus}</p><div className="living-release-gates">{Object.entries(state.releaseGates).map(([gate, done]) => <button type="button" key={gate} className={done ? "done" : ""} onClick={() => human([{ type: "release:gate", gate, author: "You" }], `toggled ${gate}.`)}>{done ? <Check size={14} /> : <Clock3 size={14} />}{gate}</button>)}</div></section></div>;
}

function WindowsDemo({ state, human }: { state: DemoState; human: (commands: DemoCommand[], note: string) => void }) {
  return <div className="living-app windows-app"><div className="canonical-row"><Database size={14} /><span>Canonical row</span><strong>{state.server.value}</strong><code>rev {state.server.revision}</code></div><div className="living-window-grid">{(["a", "b"] as const).map((key) => <section key={key}><header><Cloud size={13} /><strong>Window {key.toUpperCase()}</strong><code>loaded rev {state.windows[key].revision}</code></header><input aria-label={`Live Window ${key.toUpperCase()} value`} value={state.windows[key].value} onChange={(event) => human([{ type: "window:edit", window: key, value: event.target.value }], `edited Window ${key.toUpperCase()}.`)} /><div><button type="button" onClick={() => human([{ type: "window:save", window: key, author: "You" }], `saved Window ${key.toUpperCase()}.`)}>Save</button><button type="button" className="quiet" onClick={() => human([{ type: "window:refresh", window: key, author: "You" }], `refreshed Window ${key.toUpperCase()}.`)}>Refresh</button></div></section>)}</div><p className="living-notice">{state.windowNotice}</p></div>;
}

function ChatDemo({ state, human }: { state: DemoState; human: (commands: DemoCommand[], note: string) => void }) {
  return <div className="living-app chat-app"><aside><div><MessageSquare size={15} /><strong>Support inbox</strong><span>{state.unread}</span></div><button type="button" onClick={() => human([{ type: "chat:read" }], "marked the conversation read.")}>Checkout launch <small>{state.unread ? `${state.unread} unread` : "caught up"}</small></button><div className="chat-presence"><i /> You are here<br /><i /> Ava online<br /><i /> Luis online</div></aside><section><header><div><strong># checkout-launch</strong><small>4 people · live · you are viewing as yourself</small></div><button type="button" onClick={() => human([{ type: "chat:read" }], "cleared the unread count.")}>Mark read</button></header><div className="message-list">{state.messages.map((message) => <article className={message.mine ? "mine" : ""} key={message.id}><strong>{message.author}{message.mine ? " · you" : ""}</strong><p>{message.body}</p></article>)}</div><p className="typing-indicator">{state.typing.length ? `${state.typing.join(" and ")} ${state.typing.length > 1 ? "are" : "is"} typing…` : "Everyone is caught up."}</p><form onSubmit={(event) => { event.preventDefault(); human([{ type: "chat:send", author: "You", mine: true }], "sent a message."); }}><input aria-label="Live chat message" placeholder="Message the team as yourself" value={state.chatDraft} onChange={(event) => human([{ type: "chat:draft", value: event.target.value, author: "You" }], "updated your local message draft.")} /><button aria-label="Send live chat message"><Send size={14} /></button></form></section></div>;
}

function DocumentDemo({ state, human }: { state: DemoState; human: (commands: DemoCommand[], note: string) => void }) {
  return <div className="living-app document-app"><aside><div><FileText size={14} /><strong>Implementation brief</strong></div><button type="button" onClick={() => human([{ type: "document:focus", paragraph: "Release notes", author: "You" }], "selected Release notes.")}>Release notes</button><button type="button" onClick={() => human([{ type: "document:focus", paragraph: "Mobile checkout", author: "You" }], "selected Mobile checkout.")}>Mobile checkout</button><button type="button" onClick={() => human([{ type: "document:focus", paragraph: "Security evidence", author: "You" }], "selected Security evidence.")}>Security evidence</button></aside><section><header><div><strong>Launch readiness brief</strong><small>Editing: {state.activeParagraph}</small></div><div><span>A</span><span>L</span><button type="button" onClick={() => human([{ type: "document:checkpoint", author: "You" }], "created a durable checkpoint.")}>Save v{state.documentRevision + 1}</button></div></header><textarea aria-label="Collaborative document" value={state.documentText} onChange={(event) => human([{ type: "document:edit", value: event.target.value, author: "You" }], "edited the shared document.")} /><p>{state.documentNotice}</p></section></div>;
}

const authSteps: Array<[DemoState["authStage"], string]> = [
  ["signed-out", "Browser"], ["callback", "PKCE callback"], ["verified", "Claims verified"], ["refreshing", "Cookie refreshed"], ["ready", "RLS query"],
];
function AuthDemo({ state, human }: { state: DemoState; human: (commands: DemoCommand[], note: string) => void }) {
  const activeIndex = state.authStage === "sleeping" ? 2 : Math.max(0, authSteps.findIndex(([stage]) => stage === state.authStage));
  return <div className="living-app auth-app"><section><small>ACME WORKSPACE</small><h6>{state.authStage === "ready" ? "Welcome back, Maya" : "Sign in safely"}</h6><label htmlFor="live-auth-email">Work email</label><input id="live-auth-email" value={state.authEmail} onChange={(event) => human([{ type: "auth:email", value: event.target.value }], "updated the email field.")} placeholder="you@company.com" /><button type="button" onClick={() => human([{ type: "auth:stage", stage: "callback", notice: "You started the PKCE callback exchange." }], "started sign-in.")}>Continue with email</button></section><aside><header><LockKeyhole size={15} /><strong>Session trace</strong><span className={`auth-health ${state.authStage}`}>{state.authStage}</span></header><ol>{authSteps.map(([stage, label], index) => <li className={index <= activeIndex ? "complete" : ""} key={stage}><span>{index < activeIndex ? <Check size={12} /> : index === activeIndex ? <Clock3 size={12} /> : index + 1}</span><strong>{label}</strong></li>)}</ol><p>{state.authNotice}</p><button type="button" onClick={() => human([{ type: "auth:stage", stage: "sleeping", notice: "You simulated an expired access token with a valid refresh cookie." }], "put the tab to sleep.")}>Simulate sleeping tab</button></aside></div>;
}

function ActivityFeed({ entries }: { entries: string[] }) {
  return <aside className="live-activity" aria-live="polite"><span>ACTIVITY</span>{entries.map((entry, index) => <p key={`${entry}-${index}`} className={index === 0 ? "current" : ""}>{entry}</p>)}</aside>;
}

export function LiveStateDemo({ scenarioId }: { scenarioId: LiveScenarioId }) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const playback = useLivePlayback(scenarioId, surfaceRef);
  const actors = useMemo(() => ({ points: ["Maya", "Noah"], release: ["Maya", "Noah"], windows: ["Maya", "Noah"], chat: ["You", "Ava", "Luis", "Maya"], document: ["Ava", "Luis"], auth: ["Maya", "Server"] }[scenarioId]), [scenarioId]);
  const titles: Record<LiveScenarioId, string> = { points: "A shared balance changes across two surfaces", release: "Two requests finish in the wrong order", windows: "Two tabs edit one versioned record", chat: "Messages, presence, and unread state move together", document: "Two collaborators edit and checkpoint one brief", auth: "A cookie session survives sleep and refresh" };
  const playing = playback.inView && playback.enabled;

  return <section className={`live-state-demo live-${scenarioId}`} ref={surfaceRef} data-loop-duration-ms={LOOP_DURATION} data-story-duration-ms={STORY_DURATION} data-playback-fps={PLAYBACK_FPS} data-story-step-count={timelines[scenarioId].length} onMouseEnter={() => playback.setEnabled(true)} aria-label={`${titles[scenarioId]} live demo`}>
    <PlaybackChrome title={titles[scenarioId]} actors={actors} elapsed={playback.elapsed} playing={playing} inView={playback.inView} onToggle={() => playback.setEnabled(!playback.enabled)} onReset={() => { playback.reset(); playback.setEnabled(true); }} />
    <div className="live-demo-stage">
      {scenarioId === "points" ? <PointsDemo state={playback.state} human={playback.human} /> : null}
      {scenarioId === "release" ? <ReleaseDemo state={playback.state} human={playback.human} /> : null}
      {scenarioId === "windows" ? <WindowsDemo state={playback.state} human={playback.human} /> : null}
      {scenarioId === "chat" ? <ChatDemo state={playback.state} human={playback.human} /> : null}
      {scenarioId === "document" ? <DocumentDemo state={playback.state} human={playback.human} /> : null}
      {scenarioId === "auth" ? <AuthDemo state={playback.state} human={playback.human} /> : null}
      <CursorLayer cursors={playback.state.cursors} />
    </div>
    <ActivityFeed entries={playback.state.activity} />
  </section>;
}
