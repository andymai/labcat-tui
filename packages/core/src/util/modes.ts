/**
 * The single source of truth for prompt-mode names. The 5 entries are mirrored by:
 * - the `mode<Pascal>` tokens in `ThemeDefinition`
 * - the `:host([mode='…'])` CSS rules in `prompt-input.ts`
 * - `<tui-session>`'s `applyMode` and `<tui-prompt-input>`'s `willUpdate` validation
 *
 * Adding a 6th mode means: append here, add the matching `mode<Pascal>` to every
 * theme + `ThemeDefinition`, add a `:host([mode='X'])` block in prompt-input.ts.
 */
export const MODE_NAMES = ['autoAccept', 'bashBorder', 'permission', 'planMode', 'ide'] as const;

export type Mode = (typeof MODE_NAMES)[number];

export const MODE_SET: ReadonlySet<Mode> = new Set(MODE_NAMES);

/** `'autoAccept'` → `'--tui-mode-auto-accept'`. */
export const MODE_TO_VAR: Readonly<Record<Mode, string>> = Object.fromEntries(
  MODE_NAMES.map((name) => {
    const kebab = name.replace(/([A-Z])/g, '-$1').toLowerCase();
    return [name, `--tui-mode-${kebab}`];
  }),
) as Readonly<Record<Mode, string>>;

/** Human-readable list for warning messages. */
export const MODE_LIST = MODE_NAMES.join(' | ');
