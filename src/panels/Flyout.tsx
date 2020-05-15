import {
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiText,
  EuiTitle,
} from "@elastic/eui";
import React from "react";
import { useStore } from "../shared/store";

const Flyout = () => {
  const set = useStore((store) => store.set);

  const handleClose = () =>
    set((draft) => {
      draft.flyoutVisible = false;
    });

  return (
    <EuiFlyout
      // ownFocus
      onClose={handleClose}
      size="s"
      aria-labelledby="flyoutSmallTitle"
    >
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="s">
          <h2 id="flyoutSmallTitle">A small flyout</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiText>
          <p>
            In small flyouts, it is ok to reduce the header size to{" "}
            <code>s</code>.
          </p>
        </EuiText>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default Flyout;
