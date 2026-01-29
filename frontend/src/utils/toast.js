import toast from "react-hot-toast";

export const successToast = (msg) =>
  toast.success(msg, { icon: "✅" });

export const errorToast = (msg) =>
  toast.error(msg, { icon: "❌" });

export const infoToast = (msg) =>
  toast(msg, { icon: "ℹ️" });
