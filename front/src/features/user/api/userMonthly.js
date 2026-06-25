import { fetchWithAuth } from "../../../services/api/fetchWithAuth";                                                                  
                                                                                                                        
  export const fetchUserMonthlySummary = async (date, { toast } = {}) => {                                                              
    const res = await fetchWithAuth(`/api/user-monthly-work-summary/?date=${date}`, {}, { toast });                                  
   if (!res || !res.ok) {                                                                                                               
     throw new Error("?”ê°„ ê·¼ë¬´ ?•ë³´ë¥?ê°€?¸ì˜¤?????¤íŒ¨?ˆìŠµ?ˆë‹¤.");      
   }                                                                 
   return res.json();                                                                                                                  
};          