import { useEffect, useState } from "react";

export default function useWorkCartState() {
  const [cart, setCart] = useState([]);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (cart.length === 0 && isSubmitConfirmOpen) {
      setIsSubmitConfirmOpen(false);
    }
  }, [cart.length, isSubmitConfirmOpen]);

  return {
    cart,
    isSubmitConfirmOpen,
    isSubmitting,
    setCart,
    setIsSubmitConfirmOpen,
    setIsSubmitting,
  };
}
