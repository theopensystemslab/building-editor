import React from "react";
import { useStore } from ".";

interface Inputs {
  label: string;
  disabled?: boolean;
}

const Input: React.FC<Inputs> = ({ label, disabled }) => {
  const [value, set] = useStore((store) => [store.prefs[label], store.set]);

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
          onChange={() =>
            set((draft) => {
              draft.prefs[label] = value;
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
      <Input label="background" />
    </div>
  );
};

export default Sidebar;
