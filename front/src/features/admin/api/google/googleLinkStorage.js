export const GOOGLE_LINKED_KEY = "googleLinked";

export const markGoogleLinked = () => {
  localStorage.setItem(GOOGLE_LINKED_KEY, "1");
};

export const clearGoogleLinked = () => {
  localStorage.removeItem(GOOGLE_LINKED_KEY);
};
