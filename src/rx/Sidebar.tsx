import React from "react";
import { useStore } from ".";

interface Inputs {
  label: string;
  disabled?: boolean;
  options?: any[];
}

const Input: React.FC<Inputs> = ({ label, disabled, options }) => {
  const [value, set] = useStore((store) => [store.prefs[label], store.set]);

  if (options) {
    return (
      <div>
        <label>
          {label}
          <select
            onChange={(e) =>
              set((draft) => {
                draft.prefs[label] = e.target.value;
              })
            }
            value={value}
            disabled={disabled}
          >
            {options.map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
    );
  }

  if (typeof value === "string") {
    return (
      <div>
        <label>
          {label}
          <input
            type="text"
            onChange={(e) =>
              set((draft) => {
                draft.prefs[label] = e.target.value;
              })
            }
            value={value}
            disabled={disabled}
          />
        </label>
      </div>
    );
  }

  return (
    <div>
      <label>
        {label}
        <input
          type="checkbox"
          onChange={(e) =>
            set((draft) => {
              draft.prefs[label] = e.target.checked;
            })
          }
          checked={value}
          disabled={disabled}
        />
      </label>
    </div>
  );
};

const Sidebar = () => {
  return (
    <div id="sidebar">
      <Input label="shadows" disabled />
      <Input label="antialias" disabled />
      <Input label="windows" />
      <Input label="permanentGrid" />
      <Input
        label="background"
        options={[
          { label: "paper", value: "#dfded7" },
          { label: "blueprint", value: "#207AC3" },
          { label: "dark", value: "#111" },
        ]}
      />
    </div>
  );
};

export default Sidebar;
