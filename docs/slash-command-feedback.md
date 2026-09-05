# Slash command feedback

Agentic Remote runs Copilot slash commands two ways. SDK-backed sessions get a
structured result back and already render it. Terminal-backed sessions send the
command as keystrokes into a tmux pane, so the only evidence of what happened is
what the CLI painted on screen.

Terminal-backed sessions previously reported nothing but the command that was
sent. `/cwd` produced a notice reading `/cwd`, and a command the CLI rejected
outright looked identical to one that succeeded. Agentic Remote now captures the
pane, compares it with the frame taken before the keystrokes were sent, and
reports what the command actually printed.

## Web-native resource views

The session action menu and `/skill`, `/skills`, and `/mcp` open read-only
resource views in Agentic Remote. These commands do not invoke the provider,
type into its terminal, send a prompt, or change configuration. Text following
the command is a local list filter, not an MCP configuration operation.

The views use structured provider metadata and label session, configured-folder,
last-known and unavailable data separately. They do not claim parity with the
CLI's interactive configuration screens. See [Provider compatibility](provider-compatibility.md).
Editing a queued message into one of these local commands is refused rather
than opening a view or changing the waiting message.

## What a command reports

| Outcome | Reported as |
| --- | --- |
| The command printed text | The printed lines |
| The command opened a full-screen view | A note that the view opened in the terminal |
| The command printed nothing | The command name, as before |

A full-screen view is driven by keystrokes and repaints continuously, so its
contents are not copied into the conversation. Detecting it matters for a second
reason: while a picker is open, the CLI routes typing into its search box, so a
prompt sent from Agentic Remote would land there instead of the composer.

## Verified behavior

The following historical table records direct Copilot CLI v1.0.82 behavior
in a terminal-backed session, not the web-native aliases described above.

| Command | Reports |
| --- | --- |
| `/add-dir` | Usage error when the directory argument is missing |
| `/allow-all` | Confirmation that permissions were enabled |
| `/autopilot` | Confirmation that the mode changed |
| `/blame` | `Unknown command`, raised by the CLI |
| `/chronicle` | Full-screen view |
| `/compact` | Result, including `Nothing to compact` |
| `/config` | Full-screen view |
| `/context` | Context summary, or that none is available yet |
| `/cwd` | Working directory |
| `/env` | Agents, plugins, hooks and extensions |
| `/every` | `Unknown command`, raised by the CLI |
| `/list-dirs` | Allowed directories |
| `/mcp` | Full-screen view |
| `/memory` | Memory status and usage |
| `/model` | Full-screen view |
| `/plugin` | Full-screen view |
| `/remote` | Remote control status |
| `/rename` | Result, including why a name could not be generated |
| `/research` | Usage error when the topic argument is missing |
| `/reset-allowed-tools` | Confirmation that approvals were reset |
| `/review` | Review picker contents |
| `/session` | Full-screen view |
| `/skills` | Installed skills |
| `/usage` | Usage report |

`/blame` and `/every` are advertised by the command catalog but rejected by the
CLI. That mismatch was previously invisible, because a rejected command and a
successful one both reported only their own name.

## Queued commands

A command sent while the agent is working is queued, and reports what it printed
when it is drained rather than being treated as a prompt. Draining it does not
mark a turn as started, because the command answers in the pane instead of
asking the agent for anything.

## Limits

Nothing is reported for a command sent while the agent is already working. Its
output would arrive in the same pane as the agent's own writing, and the two
cannot be told apart. The same applies to a command that starts a turn itself:
once the pane offers to interrupt, everything appearing in it belongs to the
turn, so the command reports only its name.

A command that changes state without painting anything, such as `/plan`, also
reports only its name. The mode indicator it updates lives in the composer
chrome, which is deliberately excluded.

The CLI repaints a composer box and a status footer on every frame, and the
footer carries live counters such as token usage and diff stats. Everything from
the composer down is therefore ignored; otherwise a changing counter would be
reported as command output. The startup banner and tip are ignored for the same
reason, since they can paint after the first capture is taken.

Opening a CLI-only full-screen view is reported, but the view is not dismissed.
The app refuses ordinary prompt delivery while an overlay owns terminal input;
close the view in the CLI before sending another prompt.
