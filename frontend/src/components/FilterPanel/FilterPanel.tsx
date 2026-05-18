import type { FilterPanelAction, FilterPanelProps } from "./types";
import "./FilterPanel.css";

const getActionClassName = (
  action: FilterPanelAction,
  baseClassName: string,
  hiddenClassName?: string,
) =>
  [baseClassName, action.className, action.visible === false ? hiddenClassName : ""]
    .filter(Boolean)
    .join(" ");

const renderAction = (
  action: FilterPanelAction | undefined,
  baseClassName: string,
  hiddenClassName?: string,
) => {
  if (!action) return null;

  const isHidden = action.visible === false;

  return (
    <button
      type="button"
      className={getActionClassName(action, baseClassName, hiddenClassName)}
      onClick={action.onClick}
      aria-label={action.ariaLabel}
      aria-hidden={isHidden}
      tabIndex={isHidden ? -1 : 0}
    >
      {action.label}
    </button>
  );
};

export default function FilterPanel({
  title,
  headerAction,
  sections,
  footerAction,
  className,
}: FilterPanelProps) {
  return (
    <div className={["filter-panel", className].filter(Boolean).join(" ")}>
      {(title || headerAction) && (
        <div className="filter-panel__header">
          {title ? <span className="filter-panel__title">{title}</span> : <span />}
          {renderAction(
            headerAction,
            "filter-panel__action filter-panel__reset",
            "filter-section__action--hidden",
          )}
        </div>
      )}

      {sections.map((section, index) => {
        if (section.type === "message") {
          const variantClassName =
            section.variant === "error"
              ? "filter-message filter-message--error filter-section-error"
              : section.variant === "loading"
                ? "filter-message filter-message--loading filter-section-loading"
                : "filter-message filter-message--info";

          return (
            <div
              key={`message-${index}`}
              className={["filter-section", section.className].filter(Boolean).join(" ")}
            >
              <span className={variantClassName}>{section.text}</span>
            </div>
          );
        }

        if (section.type === "checkbox") {
          return (
            <label
              key={`checkbox-${index}`}
              className={["filter-checkbox", section.className].filter(Boolean).join(" ")}
            >
              <input
                type="checkbox"
                checked={section.checked}
                onChange={(event) => section.onChange(event.target.checked)}
              />
              {section.label}
            </label>
          );
        }

        return (
          <div
            key={`chips-${index}-${String(section.label)}`}
            className={["filter-section", section.className].filter(Boolean).join(" ")}
          >
            <div className="filter-section__header">
              <span
                className={["filter-section__label", section.labelClassName]
                  .filter(Boolean)
                  .join(" ")}
              >
                {section.label}
              </span>
              {renderAction(
                section.action,
                "filter-clear filter-section__action",
                "filter-section__action--hidden",
              )}
            </div>

            <div className="filter-chips">
              {section.items.map((item) => {
                const isSelected = section.isSelected?.(item.value) ?? false;

                return (
                  <button
                    key={String(item.value)}
                    type="button"
                    className={`filter-chip ${isSelected ? "filter-chip--active" : ""}`}
                    onClick={() => section.onClick(item.value)}
                    disabled={item.disabled}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {renderAction(
        footerAction,
        "filter-clear filter-panel__action",
        "filter-section__action--hidden",
      )}
    </div>
  );
}
