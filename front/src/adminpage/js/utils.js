// utils/formatters.js

export const formatResidentNumber = (value) => {
  const clean = value.replace(/[^0-9]/g, "").slice(0, 13);
  return clean.length > 6
    ? clean.slice(0, 6) + "-" + clean.slice(6)
    : clean;
};

export const formatPhoneNumber = (value) => {
  const clean = value.replace(/[^0-9]/g, "").slice(0, 11);

  if (clean.length >= 11) {
    return clean.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  } else if (clean.length >= 7) {
    return clean.replace(/(\d{3})(\d{4})(\d*)/, (_, g1, g2, g3) =>
      g3 ? `${g1}-${g2}-${g3}` : `${g1}-${g2}`
    );
  } else if (clean.length >= 4) {
    return clean.replace(/(\d{3})(\d*)/, (_, g1, g2) =>
      g2 ? `${g1}-${g2}` : g1
    );
  }
  return clean;
};
