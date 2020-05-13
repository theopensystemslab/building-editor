import React from "react";
import { useStore } from "../shared/store";
import styles from "./panels.module.css";

const PreferencesPanel: React.FC = () => {
  const shadowsEnabled = useStore((store) => store.preferences.shadowsEnabled);
  const set = useStore((store) => store.set);

  return (
    <div className={styles.preferencesPanel}>
      <label>
        Shadows{" "}
        <input
          type="checkbox"
          onChange={() =>
            set((state) => {
              state.preferences.shadowsEnabled = !shadowsEnabled;
            })
          }
          checked={shadowsEnabled}
        />
      </label>
    </div>
  );
};

export default PreferencesPanel;
