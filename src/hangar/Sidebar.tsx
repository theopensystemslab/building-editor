import React from "react";
import { EditMode } from "./state";
import * as rf from "react-feather";

interface Props {
  editMode: EditMode;
  onEditModeChange: (newEditMode: EditMode) => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

const Sidebar: React.FC<Props> = (props) => {
  return (
    <div className="sidebar">
      <button
        className={`sidebar-icon ${
          props.editMode === "Move" ? "sidebar-icon-active" : ""
        }`}
        onClick={() => {
          props.onEditModeChange("Move");
        }}
        title="Move Mode (m)"
      >
        <rf.Move />
      </button>
      <button
        className={`sidebar-icon ${
          props.editMode === "Insert" ? "sidebar-icon-active" : ""
        }`}
        onClick={() => {
          props.onEditModeChange("Insert");
        }}
        title="Insert Mode (i)"
      >
        <rf.Box />
      </button>
      <button
        className={`sidebar-icon ${
          props.editMode === "Resize" ? "sidebar-icon-active" : ""
        }`}
        onClick={() => {
          props.onEditModeChange("Resize");
        }}
        title="Resize Mode (r)"
      >
        <rf.PenTool />
      </button>
      <button
        className={`sidebar-icon ${
          props.editMode === "Slice" ? "sidebar-icon-active" : ""
        }`}
        onClick={() => {
          props.onEditModeChange("Slice");
        }}
        title="Slice Mode (s)"
      >
        <rf.Columns />
      </button>
      <button
        {...(props.onUndo ? { onClick: props.onUndo } : { disabled: true })}
        className="sidebar-icon"
        title="Undo (cmd+z)"
      >
        <rf.RotateCcw />
      </button>
      <button
        {...(props.onRedo ? { onClick: props.onRedo } : { disabled: true })}
        className="sidebar-icon"
        title="Redo (cmd+shift+z)"
      >
        <rf.RotateCw />
      </button>
    </div>
  );
};

export default Sidebar;
