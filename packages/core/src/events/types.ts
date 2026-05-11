export interface TuiCommandDetail {
  name: string;
  args: string;
}

export interface TuiCommandSuccessDetail {
  command: string;
  args: string;
}

export interface TuiCommandErrorDetail {
  command: string;
  args: string;
  error: unknown;
}

export interface TuiNavigateDetail {
  url: string;
}

export interface TuiThemeChangeDetail {
  from: string;
  to: string;
}

export interface TuiSlashSelectDetail {
  command: string;
}

export interface TuiTodoChangeDetail {
  status: 'pending' | 'in-progress' | 'completed';
  previousStatus: 'pending' | 'in-progress' | 'completed';
}

export interface TuiEventMap {
  'tui-command': CustomEvent<TuiCommandDetail>;
  'tui-command-success': CustomEvent<TuiCommandSuccessDetail>;
  'tui-command-error': CustomEvent<TuiCommandErrorDetail>;
  'tui-navigate': CustomEvent<TuiNavigateDetail>;
  'tui-theme-change': CustomEvent<TuiThemeChangeDetail>;
  'tui-stream-start': CustomEvent<Record<string, never>>;
  'tui-stream-complete': CustomEvent<Record<string, never>>;
  'tui-stream-interrupt': CustomEvent<Record<string, never>>;
  'tui-slash-select': CustomEvent<TuiSlashSelectDetail>;
  'tui-slash-dismiss': CustomEvent<Record<string, never>>;
  'tui-todo-change': CustomEvent<TuiTodoChangeDetail>;
}
