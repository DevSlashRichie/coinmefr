import { Fragment } from "react";
import { Transition, Dialog } from "@headlessui/react";

import cn from "classnames";

export function NeoModal({
  children,
  onClose,
  afterClose,
  open,
  disableAutoFocus,
}: {
  children: React.ReactNode;
  onClose: () => void;
  afterClose?: () => void;
  open?: boolean;
  disableAutoFocus?: boolean;
}) {
  return (
    <Transition as={Fragment} show={open}>
      <Dialog
        className="relative z-50"
        onClose={onClose}
        autoFocus={disableAutoFocus ? false : true}
        tabIndex={-1}
        role="dialog"
      >
        <div className="fixed top-0 left-0 flex justify-center items-center w-full h-full">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              aria-hidden="true"
              className="fixed inset-0 bg-black/25 z-auto"
            />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
            afterLeave={afterClose}
          >
            <Dialog.Panel className="z-50">{children}</Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

export function ModalBody({
  children,
  innerClassName,
  innerStyle,
}: {
  children: React.ReactNode;
  innerClassName?: string;
  innerStyle?: React.CSSProperties;
}) {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <div
        style={innerStyle}
        className={cn(
          "flex flex-col h-fit max-h-[88vh] bg-white rounded-xl w-full lg:w-[650px] max-w-[100vw] shadow-xl",
          innerClassName,
        )}
        onClick={(e) => {
          e.stopPropagation();
        }}
        role="presentation"
      >
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({
  label,
  onClose,
}: {
  label: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <div className="flex justify-between items-center px-5 py-3 border-b border-black/20">
      <div className="text-xl font-bold">{label}</div>
      <div>
        <button
          type="button"
          className="active:scale-90"
          onClick={() => {
            if (onClose) onClose();
          }}
        >
          X
        </button>
      </div>
    </div>
  );
}

export function ModalFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center px-5 py-3 border-t border-black/20",
        className,
      )}
    >
      {children}
    </div>
  );
}
