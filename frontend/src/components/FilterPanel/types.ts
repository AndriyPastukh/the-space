import type { ReactNode } from "react";

export type FilterValue = string | number;

export interface FilterPanelAction {
  label: ReactNode;
  onClick: () => void;
  visible?: boolean;
  className?: string;
  ariaLabel?: string;
}

export interface FilterChipItem<TValue extends FilterValue = FilterValue> {
  label: ReactNode;
  value: TValue;
  disabled?: boolean;
}

export type FilterPanelSection<TValue extends FilterValue = FilterValue> =
  | {
      type: "chips";
      label: ReactNode;
      items: FilterChipItem<TValue>[];
      isSelected?: (value: TValue) => boolean;
      onClick: (value: TValue) => void;
      action?: FilterPanelAction;
      className?: string;
      labelClassName?: string;
    }
  | {
      type: "checkbox";
      label: ReactNode;
      checked: boolean;
      onChange: (checked: boolean) => void;
      className?: string;
    }
  | {
      type: "message";
      text: ReactNode;
      variant?: "loading" | "error" | "info";
      className?: string;
    };

export interface FilterPanelProps {
  title?: ReactNode;
  headerAction?: FilterPanelAction;
  sections: FilterPanelSection[];
  footerAction?: FilterPanelAction;
  className?: string;
}
