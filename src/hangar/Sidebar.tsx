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
        title="Move Mode"
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
      >
        <rf.Columns />
      </button>
      <button
        {...(props.onUndo ? { onClick: props.onUndo } : { disabled: true })}
        className="sidebar-icon"
        title="Undo"
      >
        <rf.RotateCcw />
      </button>
      <button
        {...(props.onRedo ? { onClick: props.onRedo } : { disabled: true })}
        className="sidebar-icon"
        title="Redo"
      >
        <rf.RotateCw />
      </button>
    </div>
  );
};

export default Sidebar;
