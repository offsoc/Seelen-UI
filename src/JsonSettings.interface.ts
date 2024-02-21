/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type ApplicationIdentifier = "Exe" | "Class" | "Title";
export type MatchingStrategy = "Legacy" | "Equals" | "StartsWith" | "EndsWith" | "Contains" | "Regex";
export type MoveBehaviour = "Swap" | "Insert";
export type FocusFollowsMouseImplementation = "Komorebi" | "Windows";
export type DefaultLayout = "BSP" | "Columns" | "Rows" | "VerticalStack" | "HorizontalStack" | "UltrawideVerticalStack";
export type OperationBehaviour = "Op" | "NoOp";
export type WindowContainerBehaviour = "Create" | "Append";
export type HidingBehaviour = "Hide" | "Minimize" | "Cloak";

export interface StaticConfig {
  /**
   * Display an active window border (default: false)
   */
  active_window_border?: boolean | null;
  /**
   * Set display index preferences
   */
  display_index_preferences?: {
    [k: string]: string;
  };
  /**
   * Active window border colours for different container types
   */
  active_window_border_colours?: ActiveWindowBorderColours | null;
  /**
   * Offset of the active window border (default: None)
   */
  active_window_border_offset?: number | null;
  /**
   * Width of the active window border (default: 20)
   */
  active_window_border_width?: number | null;
  /**
   * Always send the ALT key when using focus commands (default: false)
   */
  alt_focus_hack?: boolean | null;
  /**
   * Auto stack windows with the same category in the workspace (default: false)
   */
  auto_stack_by_category?: boolean;
  /**
   * Path to applications.yaml from komorebi-application-specific-configurations (default: None)
   */
  app_specific_configuration_path?: string | null;
  /**
   * Configurations for native Windows and Komorebi animations
   */
  animations?: null | {
    /**
     * native windows animations delay for consecutive actions in ms (default: 35)
     */
    native_animations_delay?: number;
    /**
     * wait for minimization before restore workspace (default: true)
     */
    finish_miminization_before_restore?: boolean;
    [k: string]: unknown;
  };
  /**
   * Identify border overflow applications
   */
  border_overflow_applications?: IdWithIdentifier[] | null;
  /**
   * Determine what happens when a window is moved across a monitor boundary (default: Swap)
   */
  cross_monitor_move_behaviour?: MoveBehaviour | null;
  /**
   * Global default container padding (default: 10)
   */
  default_container_padding?: number | null;
  /**
   * Global default workspace padding (default: 10)
   */
  default_workspace_padding?: number | null;
  /**
   * Exclude floating rules
   */
  exclude_float_rules?: IdWithIdentifier[] | null;
  /**
   * Individual window floating rules
   */
  float_rules?: IdWithIdentifier[] | null;
  /**
   * Determine focus follows mouse implementation (default: None)
   */
  focus_follows_mouse?: FocusFollowsMouseImplementation | null;
  /**
   * Global work area (space used for tiling) offset (default: None)
   */
  global_work_area_offset?: Rect | null;
  /**
   * Dimensions of Windows' own invisible borders; don't set these yourself unless you are told to
   */
  invisible_borders?: Rect | null;
  /**
   * Identify applications that have the WS_EX_LAYERED extended window style
   */
  layered_applications?: IdWithIdentifier[] | null;
  /**
   * Individual window force-manage rules
   */
  manage_rules?: IdWithIdentifier[] | null;
  /**
   * Set monitor index preferences
   */
  monitor_index_preferences?: {
    [k: string]: Rect;
  } | null;
  /**
   * Monitor and workspace configurations
   */
  monitors?: MonitorConfig[] | null;
  /**
   * Enable or disable mouse follows focus (default: true)
   */
  mouse_follows_focus?: boolean | null;
  /**
   * Identify applications that send EVENT_OBJECT_NAMECHANGE on launch (very rare)
   */
  object_name_change_applications?: IdWithIdentifier[] | null;
  /**
   * Delta to resize windows by (default 50)
   */
  resize_delta?: number | null;
  /**
   * Configurations for top bar on containers
   */
  top_bar?: {
    /**
     * When komorebi shows tab bar
     */
    mode?: "Always" | "OnStack" | "Never";
    height?: number;
    tabs?: {
      width?: number;
      /**
       * Text and icons colors on top bar
       */
      color?: string;
      /**
       * Background color
       */
      background?: string;
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  /**
   * Identify tray and multi-window applications
   */
  tray_and_multi_window_applications?: IdWithIdentifier[] | null;
  /**
   * Unmanaged windows rules (can work as pinned windows)
   */
  unmanage_rules?: IdWithIdentifier[] | null;
  /**
   * Determine what happens when commands are sent while an unmanaged window is in the foreground (default: Op)
   */
  unmanaged_window_operation_behaviour?: OperationBehaviour | null;
  /**
   * Determine what happens when a new window is opened (default: Create)
   */
  window_container_behaviour?: WindowContainerBehaviour | null;
  /**
   * Which Windows signal to use when hiding windows (default: minimize)
   */
  window_hiding_behaviour?: HidingBehaviour | null;
  [k: string]: unknown;
}
export interface ActiveWindowBorderColours {
  /**
   * Border colour when the container is in monocle mode
   */
  monocle: Rgb;
  /**
   * Border colour when the container contains a single window
   */
  single: Rgb;
  /**
   * Border colour when the container contains multiple windows
   */
  stack: Rgb;
  [k: string]: unknown;
}
export interface Rgb {
  /**
   * Blue
   */
  b: number;
  /**
   * Green
   */
  g: number;
  /**
   * Red
   */
  r: number;
  [k: string]: unknown;
}
export interface IdWithIdentifier {
  id: string;
  kind: ApplicationIdentifier;
  matching_strategy?: MatchingStrategy | null;
  [k: string]: unknown;
}
export interface Rect {
  /**
   * The bottom point in a Win32 Rect
   */
  bottom: number;
  /**
   * The left point in a Win32 Rect
   */
  left: number;
  /**
   * The right point in a Win32 Rect
   */
  right: number;
  /**
   * The top point in a Win32 Rect
   */
  top: number;
  [k: string]: unknown;
}
export interface MonitorConfig {
  /**
   * Monitor-specific work area offset (default: None)
   */
  work_area_offset?: Rect | null;
  /**
   * Workspace configurations
   */
  workspaces: WorkspaceConfig[];
  [k: string]: unknown;
}
export interface WorkspaceConfig {
  /**
   * Container padding (default: global)
   */
  container_padding?: number | null;
  /**
   * Custom Layout (default: None)
   */
  custom_layout?: string | null;
  /**
   * Layout rules (default: None)
   */
  custom_layout_rules?: {
    [k: string]: string;
  } | null;
  /**
   * Initial workspace application rules
   */
  initial_workspace_rules?: IdWithIdentifier[] | null;
  /**
   * Layout (default: BSP)
   */
  layout?: DefaultLayout | null;
  /**
   * Layout rules (default: None)
   */
  layout_rules?: {
    [k: string]: DefaultLayout;
  } | null;
  /**
   * Name
   */
  name: string;
  /**
   * Container padding (default: global)
   */
  workspace_padding?: number | null;
  /**
   * Permanent workspace application rules
   */
  workspace_rules?: IdWithIdentifier[] | null;
  [k: string]: unknown;
}
