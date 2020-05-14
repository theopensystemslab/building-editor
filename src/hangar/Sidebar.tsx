import React from "react";
import * as rf from "react-feather";
import { EditMode } from "../shared/store";
import "./sidebar.css";

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
          props.editMode === EditMode.Move ? "sidebar-icon-active" : ""
        }`}
        onClick={() => {
          props.onEditModeChange(EditMode.Move);
        }}
        title="Move Mode (m)"
      >
        <rf.Move />
      </button>
      <button
        className={`sidebar-icon ${
          props.editMode === EditMode.Insert ? "sidebar-icon-active" : ""
        }`}
        onClick={() => {
          props.onEditModeChange(EditMode.Insert);
        }}
        title="Insert Mode (i)"
      >
        <rf.Box />
      </button>
      <button
        className={`sidebar-icon ${
          props.editMode === EditMode.Resize ? "sidebar-icon-active" : ""
        }`}
        onClick={() => {
          props.onEditModeChange(EditMode.Resize);
        }}
        title="Resize Mode (r)"
      >
        <rf.PenTool />
      </button>
      <button
        className={`sidebar-icon ${
          props.editMode === EditMode.Slice ? "sidebar-icon-active" : ""
        }`}
        onClick={() => {
          props.onEditModeChange(EditMode.Slice);
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
